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
      const response = await sql`
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
          RETURNING id as "registration_id", user_id AS "userId", workshop_id AS "workshopId", status
        ), new_payments AS (
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
        )
        SELECT * FROM new_registration
      `;

      return response[0] ?? null;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getWorkshopRegisteredStudents: async (workshopId) => {
    try {
      const response = await sql`
      SELECT u.id AS "userId", u.full_name AS "fullName", u.email AS "email", r.registered_at AS "registeredAt", r.status
      FROM registrations AS r JOIN users AS u ON r.user_id = u.id
      WHERE r.workshop_id = ${workshopId} AND r.status IN ('pending', 'confirmed')
    `;

      return response;
    } catch (e) {
      throw e;
    }
  },

  findWorkshopId: async (registrationId) => {
    try {
      const response = await sql`
        SELECT workshop_id AS "workshopId"
        FROM registrations
        WHERE id = ${registrationId}
      `;

      return response[0] ?? null;
    } catch (e) {
      throw e;
    }
  },

  getRegistrationStatus: async (workshopId, userId) => {
    try {
      const response = await sql`
        SELECT status
        FROM registrations
        WHERE workshop_id = ${workshopId} AND user_id = ${userId}
      `;      
      return response[0]?.status ?? null;
    } catch (e) {
      throw e;
    }
  },

  getWorkshopConfirmedRegistrations: async (workshopId) => {
    try {
      const registrations = await sql`
        SELECT r.id AS "registrationId", u.id AS "userId", u.full_name AS "fullName", u.email AS "email", r.registered_at AS "registeredAt"
        FROM registrations AS r JOIN users AS u ON r.user_id = u.id
        WHERE r.workshop_id = ${workshopId} AND r.status IN ('confirmed')
      `;

      return registrations;
    } catch (e) {
      throw e;
    }
  },
};
