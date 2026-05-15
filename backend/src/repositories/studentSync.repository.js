import sql from "../config/db.js";

export const studentSyncRepository = {
  findCompletedImportByHash: async (fileSha256) => {
    const rows = await sql`
      SELECT id, filename, status, finished_at AS "finishedAt"
      FROM student_imports
      WHERE file_sha256 = ${fileSha256}
        AND status = 'completed'
      LIMIT 1
    `;

    return rows[0] ?? null;
  },

  createImport: async ({ filename, fileSha256, sourcePath, totalRows }) => {
    const rows = await sql`
      INSERT INTO student_imports (
        filename,
        file_sha256,
        source_path,
        status,
        total_rows,
        success,
        failed,
        errors
      ) VALUES (
        ${filename},
        ${fileSha256},
        ${sourcePath},
        'running',
        ${totalRows},
        0,
        0,
        '[]'::jsonb
      )
      RETURNING id
    `;

    return rows[0];
  },

  completeImport: async ({
    importId,
    status,
    success,
    failed,
    created,
    updated,
    passwordReset,
    inactive,
    cancelledRegistrations,
    reportPath,
    rejectedPath,
    errors,
  }) => {
    const rows = await sql`
      UPDATE student_imports
      SET
        status = ${status},
        success = ${success},
        failed = ${failed},
        created_count = ${created},
        updated_count = ${updated},
        password_reset_count = ${passwordReset},
        inactive_count = ${inactive},
        cancelled_registration_count = ${cancelledRegistrations},
        report_path = ${reportPath},
        rejected_path = ${rejectedPath},
        errors = ${sql.json(errors ?? [])},
        finished_at = CURRENT_TIMESTAMP
      WHERE id = ${importId}
      RETURNING id, status
    `;

    return rows[0] ?? null;
  },

  failImport: async ({ importId, errors, rejectedPath }) => {
    const rows = await sql`
      UPDATE student_imports
      SET
        status = 'failed',
        failed = COALESCE(total_rows, 0),
        rejected_path = ${rejectedPath},
        errors = ${sql.json(errors ?? [])},
        finished_at = CURRENT_TIMESTAMP
      WHERE id = ${importId}
      RETURNING id, status
    `;

    return rows[0] ?? null;
  },

  listImports: async ({ page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    return sql`
      SELECT
        id,
        filename,
        status,
        total_rows AS "totalRows",
        success,
        failed,
        created_count AS "createdCount",
        updated_count AS "updatedCount",
        password_reset_count AS "passwordResetCount",
        inactive_count AS "inactiveCount",
        cancelled_registration_count AS "cancelledRegistrationCount",
        report_path AS "reportPath",
        rejected_path AS "rejectedPath",
        started_at AS "startedAt",
        finished_at AS "finishedAt"
      FROM student_imports
      ORDER BY started_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  },

  findUserByStudentId: async (tx, studentId) => {
    const rows = await tx`
      SELECT
        id,
        student_id AS "studentId",
        email,
        full_name AS "fullName",
        role,
        password_hash AS "passwordHash",
        is_active AS "isActive"
      FROM users
      WHERE student_id = ${studentId}
      LIMIT 1
    `;

    return rows[0] ?? null;
  },

  findUserByEmail: async (tx, email) => {
    const rows = await tx`
      SELECT
        id,
        student_id AS "studentId",
        email,
        full_name AS "fullName",
        role,
        password_hash AS "passwordHash",
        is_active AS "isActive"
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    return rows[0] ?? null;
  },

  createStudentUser: async (tx, { studentId, fullName, email, passwordHash, isActive }) => {
    const rows = await tx`
      INSERT INTO users (
        student_id,
        email,
        full_name,
        role,
        password_hash,
        is_active
      ) VALUES (
        ${studentId},
        ${email},
        ${fullName},
        'student',
        ${passwordHash},
        ${isActive}
      )
      RETURNING id, student_id AS "studentId", email, full_name AS "fullName", is_active AS "isActive"
    `;

    return rows[0] ?? null;
  },

  updateStudentUser: async (
    tx,
    { userId, studentId, fullName, email, passwordHash, shouldResetPassword, isActive },
  ) => {
    const rows = shouldResetPassword
      ? await tx`
          UPDATE users
          SET
            student_id = ${studentId},
            email = ${email},
            full_name = ${fullName},
            password_hash = ${passwordHash},
            is_active = ${isActive},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, student_id AS "studentId", email, full_name AS "fullName", is_active AS "isActive"
        `
      : await tx`
          UPDATE users
          SET
            student_id = ${studentId},
            email = ${email},
            full_name = ${fullName},
            is_active = ${isActive},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, student_id AS "studentId", email, full_name AS "fullName", is_active AS "isActive"
        `;

    return rows[0] ?? null;
  },

  cancelRegistrationsForInactiveStudent: async (tx, userId) => {
    const rows = await tx`
      WITH cancelled AS (
        UPDATE registrations
        SET
          status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
          AND status IN ('pending', 'confirmed')
        RETURNING workshop_id
      ), slot_delta AS (
        SELECT workshop_id, COUNT(*)::int AS count
        FROM cancelled
        GROUP BY workshop_id
      )
      UPDATE workshops AS w
      SET
        available_slots = LEAST(w.capacity, w.available_slots + slot_delta.count),
        updated_at = CURRENT_TIMESTAMP
      FROM slot_delta
      WHERE w.id = slot_delta.workshop_id
      RETURNING slot_delta.count
    `;

    return rows.reduce((total, row) => total + Number(row.count ?? 0), 0);
  },

  runInTransaction: async (callback) => sql.begin(callback),
};

