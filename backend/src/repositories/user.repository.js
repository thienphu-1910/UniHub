import sql from "../config/db.js";

export const userRepository = {
  getUserViaEmail: async (email) => {
    try {
      const user = await sql`
        SELECT id AS "userId", full_name AS "fullName", student_id AS "studentId", email, role, password_hash AS password
        FROM users
        WHERE email = ${email}
      `;
    
      return user ? user[0] : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  getUserViaId: async (id) => {
    try {
      const user = await sql`
        SELECT id AS "userId", full_name AS "fullName", student_id AS "studentId", email, role
        FROM users
        WHERE id = ${id}
      `;

      return user ? user[0] : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}