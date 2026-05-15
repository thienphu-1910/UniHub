import z from "zod";

const ACTIVE_VALUES = new Set(["", "active", "true", "1", "yes", "y"]);
const INACTIVE_VALUES = new Set([
  "inactive",
  "false",
  "0",
  "no",
  "n",
  "disabled",
  "suspended",
  "graduated",
]);

export const normalizeStudentCsvHeader = (header) => {
  const normalized = String(header || "")
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, "")
    .replace(/[\s-]+/g, "_");

  const aliases = {
    studentid: "student_id",
    student_id: "student_id",
    student: "student_id",
    mssv: "student_id",
    ma_sv: "student_id",
    ma_sinh_vien: "student_id",
    full_name: "full_name",
    fullname: "full_name",
    name: "full_name",
    ho_ten: "full_name",
    email: "email",
    mail: "email",
    status: "status",
    is_active: "status",
    active: "status",
    updated_at: "updated_at",
    update_at: "updated_at",
    last_updated_at: "updated_at",
  };

  return aliases[normalized] || normalized;
};

const normalizeStatus = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (ACTIVE_VALUES.has(normalized)) return true;
  if (INACTIVE_VALUES.has(normalized)) return false;

  throw new Error(`Unsupported status "${value}"`);
};

export const StudentCsvRowSchema = z
  .object({
    student_id: z.coerce
      .string()
      .trim()
      .min(1, "student_id is required")
      .max(20, "student_id is too long"),
    full_name: z.coerce
      .string()
      .trim()
      .min(1, "full_name is required")
      .max(255, "full_name is too long"),
    email: z.coerce
      .string()
      .trim()
      .toLowerCase()
      .email("email is invalid")
      .max(255, "email is too long"),
    status: z.any().optional(),
    updated_at: z.any().optional(),
  })
  .passthrough()
  .transform((row) => ({
    studentId: row.student_id,
    fullName: row.full_name,
    email: row.email,
    isActive: normalizeStatus(row.status),
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    rawPayload: row,
  }))
  .refine(
    (row) => row.updatedAt === null || !Number.isNaN(row.updatedAt.getTime()),
    {
      message: "updated_at is invalid",
      path: ["updated_at"],
    },
  );

