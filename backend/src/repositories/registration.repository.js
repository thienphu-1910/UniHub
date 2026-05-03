import sql from "../config/db.js";

export const registrationRepository = {
  createRegistration: async ({
    id,
    userId,
    workshopId,
    status,
    qrCode,
    qrCodeUrl,
    registeredAt,
  }) => {
    try {
      const registrations = await sql`
        INSERT INTO registrations (
          id,
          user_id,
          workshop_id,
          status,
          qr_code,
          qr_code_url,
          registered_at,
          confirmed_at,
          cancelled_at
        ) VALUES (
          ${id},
          ${userId},
          ${workshopId},
          ${status},
          ${qrCode},
          ${qrCodeUrl},
          ${registeredAt},
          NULL,
          NULL
        )
        RETURNING
          id,
          user_id AS "userId",
          workshop_id AS "workshopId",
          status,
          qr_code AS "qrCode",
          qr_code_url AS "qrCodeUrl",
          registered_at AS "registeredAt",
          confirmed_at AS "confirmedAt",
          cancelled_at AS "cancelledAt"
      `;

      return registrations[0] || null;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
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
