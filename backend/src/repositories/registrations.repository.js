import sql from "../config/db.js";

export const registrationsRepository = {
  getAllWorkshopRegisteredStudent: async (workshopId) => {
    try {
      const response = sql`
      SELECT u.id AS "userId", u.full_name AS "fullName", u.email AS "email", r.registered_at AS "registeredAt", r.status
      FROM registrations AS r JOIN users AS u ON r.user_id = u.id
      WHERE r.workshop_id = ${workshopId} AND r.status IN ("pending", "confirmed")
    `;
      
      return response;
    } catch (e) {
      throw e;
    }
  },
};
