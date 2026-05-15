import sql from "../config/db.js";
import { registrationStatuses, paymentStatuses } from "../enums/status.enum.js";

export const registrationRepository = {
  createRegistration: async ({
    id,
    userId,
    workshopId,
    registrationStatus,
    paymentStatus,
    idempotencyKey,
    amount,
  }) => {
    try {
      await sql`
        WITH new_registration AS (
          INSERT INTO registrations (
            id,
            user_id,
            workshop_id,
            status,
            qr_code,
            qr_code_url,
            confirmed_at,
            cancelled_at
          ) VALUES (
            ${id},
            ${userId},
            ${workshopId},
            ${registrationStatus},
            NULL,
            NULL,
            NULL,
            NULL
          )
          RETURNING id as "registration_id"
        )
          INSERT INTO payments (
            registration_id,
            idempotency_key,
            amount, 
            status,
            gateway,
            gateway_txn_id,
            gateway_response
          ) 
          SELECT registration_id, ${idempotencyKey}, ${amount}, ${paymentStatus}, NULL, NULL, NULL
          FROM new_registration
      `;

      return true;
    } catch (error) {
      console.log(error);
      return false;
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

  findWorkshopId: async (registrationId) => {
    try {
      const response = sql`
        SELECT workshop_id AS "workshopId"
        FROM registrations
        WHERE id = ${registrationId}
      `;

      return response[0] ?? null;
    } catch (e) {
      throw e;
    }
  }
};
