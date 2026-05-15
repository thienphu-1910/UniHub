import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import { parse } from "csv-parse/sync";
import {
  normalizeStudentCsvHeader,
  StudentCsvRowSchema,
} from "../schemas/studentCsv.schema.js";
import { studentSyncRepository } from "../repositories/studentSync.repository.js";

const DEFAULT_BASE_DIR = path.resolve(process.cwd(), "data", "student-sync");
const DEFAULT_PASSWORD = "UniHub@123456";
const DEFAULT_FILE_PREFIX = "students_";
const DEFAULT_FILE_SUFFIX = ".csv";

const getSyncDirs = () => {
  const baseDir = path.resolve(process.env.STUDENT_SYNC_BASE_DIR || DEFAULT_BASE_DIR);

  return {
    baseDir,
    incomingDir: path.resolve(
      process.env.STUDENT_SYNC_INCOMING_DIR || path.join(baseDir, "incoming"),
    ),
    processedDir: path.resolve(
      process.env.STUDENT_SYNC_PROCESSED_DIR || path.join(baseDir, "processed"),
    ),
    failedDir: path.resolve(
      process.env.STUDENT_SYNC_FAILED_DIR || path.join(baseDir, "failed"),
    ),
    reportsDir: path.resolve(
      process.env.STUDENT_SYNC_REPORTS_DIR || path.join(baseDir, "reports"),
    ),
    rejectedDir: path.resolve(
      process.env.STUDENT_SYNC_REJECTED_DIR || path.join(baseDir, "rejected"),
    ),
  };
};

const ensureDirs = async (dirs) => {
  await Promise.all(
    [
      dirs.incomingDir,
      dirs.processedDir,
      dirs.failedDir,
      dirs.reportsDir,
      dirs.rejectedDir,
    ].map((dir) => fs.mkdir(dir, { recursive: true })),
  );
};

const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const escapeCsvValue = (value) => {
  const text = value === null || typeof value === "undefined" ? "" : String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
};

const writeCsv = async ({ filePath, headers, rows }) => {
  const content = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ].join("\n");

  await fs.writeFile(filePath, `${content}\n`, "utf8");
};

const findLatestCsvFile = async (incomingDir) => {
  const prefix = process.env.STUDENT_SYNC_FILE_PREFIX || DEFAULT_FILE_PREFIX;
  const suffix = process.env.STUDENT_SYNC_FILE_SUFFIX || DEFAULT_FILE_SUFFIX;
  const entries = await fs.readdir(incomingDir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.startsWith(prefix) &&
          entry.name.toLowerCase().endsWith(suffix),
      )
      .map(async (entry) => {
        const filePath = path.join(incomingDir, entry.name);
        const stat = await fs.stat(filePath);
        return { filePath, filename: entry.name, mtimeMs: stat.mtimeMs };
      }),
  );

  files.sort((a, b) => a.mtimeMs - b.mtimeMs);
  return files[0] ?? null;
};

const parseRows = (content) =>
  parse(content, {
    bom: true,
    columns: (headers) => headers.map(normalizeStudentCsvHeader),
    skip_empty_lines: true,
    trim: true,
  });

const safeParseStudentRow = (record, rowNo) => {
  try {
    const parsed = StudentCsvRowSchema.safeParse(record);
    if (parsed.success) {
      return {
        ok: true,
        row: {
          ...parsed.data,
          rowNo,
        },
      };
    }

    return {
      ok: false,
      error: parsed.error.issues.map((issue) => issue.message).join("; "),
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "Invalid student row",
    };
  }
};

const dedupeByStudentId = (rows) => {
  const byStudentId = new Map();
  let duplicateCount = 0;

  for (const row of rows) {
    const current = byStudentId.get(row.studentId);
    if (!current) {
      byStudentId.set(row.studentId, row);
      continue;
    }

    duplicateCount += 1;
    const currentTime = current.updatedAt?.getTime() ?? 0;
    const rowTime = row.updatedAt?.getTime() ?? 0;

    if (rowTime >= currentTime) {
      byStudentId.set(row.studentId, row);
    }
  }

  return {
    rows: Array.from(byStudentId.values()),
    duplicateCount,
  };
};

const buildReportRow = ({
  student,
  action,
  passwordReset,
  defaultPassword,
  cancelledRegistrations,
  error = "",
}) => ({
  student_id: student?.studentId || "",
  email: student?.email || "",
  full_name: student?.fullName || "",
  action,
  is_active: typeof student?.isActive === "boolean" ? String(student.isActive) : "",
  password_reset: String(Boolean(passwordReset)),
  temporary_password: passwordReset ? defaultPassword : "",
  cancelled_registrations: cancelledRegistrations || 0,
  error,
});

const moveFile = async ({ sourcePath, targetDir, filename }) => {
  const targetPath = path.join(targetDir, filename);
  await fs.rename(sourcePath, targetPath);
  return targetPath;
};

const upsertStudent = async ({
  tx,
  student,
  passwordHash,
  defaultPassword,
  resetExistingPassword,
}) => {
  const existingByStudentId = await studentSyncRepository.findUserByStudentId(
    tx,
    student.studentId,
  );
  const existingByEmail = await studentSyncRepository.findUserByEmail(tx, student.email);

  if (
    existingByEmail &&
    existingByStudentId &&
    existingByEmail.id !== existingByStudentId.id
  ) {
    return buildReportRow({
      student,
      action: "rejected",
      passwordReset: false,
      defaultPassword,
      cancelledRegistrations: 0,
      error: `email already belongs to student_id ${existingByEmail.studentId || "unknown"}`,
    });
  }

  if (existingByEmail && !existingByStudentId) {
    if (existingByEmail.role !== "student") {
      return buildReportRow({
        student,
        action: "rejected",
        passwordReset: false,
        defaultPassword,
        cancelledRegistrations: 0,
        error: `email belongs to non-student role ${existingByEmail.role}`,
      });
    }

    if (existingByEmail.studentId && existingByEmail.studentId !== student.studentId) {
      return buildReportRow({
        student,
        action: "rejected",
        passwordReset: false,
        defaultPassword,
        cancelledRegistrations: 0,
        error: `email already belongs to student_id ${existingByEmail.studentId}`,
      });
    }
  }

  const existing = existingByStudentId || existingByEmail;
  let action = "updated";
  let passwordReset = false;
  let cancelledRegistrations = 0;
  let user;

  if (!existing) {
    user = await studentSyncRepository.createStudentUser(tx, {
      ...student,
      passwordHash,
    });
    action = "created";
    passwordReset = true;
  } else {
    passwordReset = resetExistingPassword || !existing.passwordHash;
    user = await studentSyncRepository.updateStudentUser(tx, {
      userId: existing.id,
      ...student,
      passwordHash,
      shouldResetPassword: passwordReset,
    });
  }

  if (!student.isActive && user?.id) {
    cancelledRegistrations =
      await studentSyncRepository.cancelRegistrationsForInactiveStudent(tx, user.id);
  }

  return buildReportRow({
    student,
    action,
    passwordReset,
    defaultPassword,
    cancelledRegistrations,
  });
};

export const studentSyncService = {
  runLatestChunk: async ({ sourceFile } = {}) => {
    const dirs = getSyncDirs();
    await ensureDirs(dirs);

    const selectedFile = sourceFile
      ? {
          filePath: path.resolve(sourceFile),
          filename: path.basename(sourceFile),
        }
      : await findLatestCsvFile(dirs.incomingDir);

    if (!selectedFile) {
      return {
        success: true,
        skipped: true,
        message: `No CSV found in ${dirs.incomingDir}`,
      };
    }

    const startedAt = getTimestamp();
    const buffer = await fs.readFile(selectedFile.filePath);
    const fileHash = sha256(buffer);
    const completedImport =
      await studentSyncRepository.findCompletedImportByHash(fileHash);

    if (completedImport) {
      const processedPath = await moveFile({
        sourcePath: selectedFile.filePath,
        targetDir: dirs.processedDir,
        filename: `${startedAt}_${selectedFile.filename}`,
      });

      return {
        success: true,
        skipped: true,
        code: "CSV_ALREADY_IMPORTED",
        processedPath,
        previousImport: completedImport,
      };
    }

    let records;
    try {
      records = parseRows(buffer.toString("utf8"));
    } catch (error) {
      const failedPath = await moveFile({
        sourcePath: selectedFile.filePath,
        targetDir: dirs.failedDir,
        filename: `${startedAt}_${selectedFile.filename}`,
      });

      return {
        success: false,
        code: "CSV_PARSE_FAILED",
        failedPath,
        error: error?.message || "CSV parse failed",
      };
    }

    const importRecord = await studentSyncRepository.createImport({
      filename: selectedFile.filename,
      fileSha256: fileHash,
      sourcePath: selectedFile.filePath,
      totalRows: records.length,
    });

    const validRows = [];
    const rejectedRows = [];

    records.forEach((record, index) => {
      const rowNo = index + 2;
      const parsed = safeParseStudentRow(record, rowNo);

      if (parsed.ok) {
        validRows.push(parsed.row);
      } else {
        rejectedRows.push({
          row_no: rowNo,
          student_id: record.student_id || "",
          email: record.email || "",
          full_name: record.full_name || "",
          error: parsed.error,
        });
      }
    });

    const { rows: dedupedRows, duplicateCount } = dedupeByStudentId(validRows);
    const defaultPassword = process.env.STUDENT_SYNC_DEFAULT_PASSWORD || DEFAULT_PASSWORD;
    const resetExistingPassword =
      process.env.STUDENT_SYNC_RESET_EXISTING_PASSWORD === "true";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const reportRows = [];

    if (dedupedRows.length > 0) {
      await studentSyncRepository.runInTransaction(async (tx) => {
        for (const student of dedupedRows) {
          const reportRow = await upsertStudent({
            tx,
            student,
            passwordHash,
            defaultPassword,
            resetExistingPassword,
          });
          reportRows.push(reportRow);
        }
      });
    }

    const rejectedFromDb = reportRows
      .filter((row) => row.action === "rejected")
      .map((row) => ({
        row_no: "",
        student_id: row.student_id,
        email: row.email,
        full_name: row.full_name,
        error: row.error,
      }));

    const allRejectedRows = [...rejectedRows, ...rejectedFromDb];
    const reportPath = path.join(dirs.reportsDir, `${startedAt}_student_sync_report.csv`);
    const rejectedPath =
      allRejectedRows.length > 0
        ? path.join(dirs.rejectedDir, `${startedAt}_rejected_${selectedFile.filename}`)
        : null;

    await writeCsv({
      filePath: reportPath,
      headers: [
        "student_id",
        "email",
        "full_name",
        "action",
        "is_active",
        "password_reset",
        "temporary_password",
        "cancelled_registrations",
        "error",
      ],
      rows: reportRows,
    });

    if (rejectedPath) {
      await writeCsv({
        filePath: rejectedPath,
        headers: ["row_no", "student_id", "email", "full_name", "error"],
        rows: allRejectedRows,
      });
    }

    const successfulRows = reportRows.filter((row) => row.action !== "rejected");
    const metrics = {
      created: successfulRows.filter((row) => row.action === "created").length,
      updated: successfulRows.filter((row) => row.action === "updated").length,
      passwordReset: successfulRows.filter((row) => row.password_reset === "true").length,
      inactive: successfulRows.filter((row) => row.is_active === "false").length,
      cancelledRegistrations: successfulRows.reduce(
        (total, row) => total + Number(row.cancelled_registrations || 0),
        0,
      ),
    };

    const status = successfulRows.length > 0 ? "completed" : "failed";
    await studentSyncRepository.completeImport({
      importId: importRecord.id,
      status,
      success: successfulRows.length,
      failed: allRejectedRows.length,
      ...metrics,
      reportPath,
      rejectedPath,
      errors: allRejectedRows,
    });

    const targetDir = status === "completed" ? dirs.processedDir : dirs.failedDir;
    const finalPath = await moveFile({
      sourcePath: selectedFile.filePath,
      targetDir,
      filename: `${startedAt}_${selectedFile.filename}`,
    });

    return {
      success: status === "completed",
      status,
      importId: importRecord.id,
      totalRows: records.length,
      validRows: dedupedRows.length,
      duplicateRows: duplicateCount,
      rejectedRows: allRejectedRows.length,
      ...metrics,
      reportPath,
      rejectedPath,
      finalPath,
    };
  },

  listImports: studentSyncRepository.listImports,
};

