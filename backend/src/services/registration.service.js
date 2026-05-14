import { randomUUID } from "node:crypto";
import redis from "../config/redis.js";
import {
  REGISTRATION_HOLD_TTL_SECONDS,
  buildMockPaymentUrl,
} from "../config/registration.js";
import { registrationRepository } from "../repositories/registration.repository.js";
import { addRegistrationJob } from "../jobs/queues/registration.queue.js";
import { registrationStatuses, paymentStatuses } from "../enums/status.enum.js";

export const registrationService = {
  createRegistration: async ({ workshopId, user }) => {
    if (!workshopId) {
      return {
        success: false,
        statusCode: 400,
        code: "WORKSHOP_ID_REQUIRED",
        message: "Workshop id is required",
      };
    }

    if (!user?.userId || !user?.studentId) {
      return {
        success: false,
        statusCode: 403,
        code: "STUDENT_INFO_MISSING",
        message: "Student information is missing",
      };
    }

    const slotKey = `workshop:${workshopId}:slots`;
    const holdKey = `slot:hold:${workshopId}:${user.studentId}`;
    const workshopKey = `workshop:${workshopId}`;

    const registrationId = randomUUID();
    const registeredAt = new Date();

    const isPaid = redis.hget(workshopKey, "isPaid") === "true";
    let qrCode = null;
    let qrCodeUrl = null;
    if (isPaid) {
      qrCode = `MOCK_VIETQR:${registrationId}`;
      qrCodeUrl = buildMockPaymentUrl({
        registrationId,
        workshopId,
        studentId: user.studentId,
      });
    }

    const registrationStatus = isPaid
      ? registrationStatuses.PENDING
      : registrationStatuses.CONFIRMED;
    const paymentStatus = isPaid
      ? paymentStatuses.PENDING
      : paymentStatuses.SUCCESS;

    let slotReserved = false;

    try {
      const remainingSlots = await redis.decr(slotKey);
      slotReserved = true;

      if (remainingSlots < 0) {
        await redis.incr(slotKey);
        slotReserved = false;

        return {
          success: false,
          statusCode: 409,
          code: "WORKSHOP_FULL",
          message: "Workshop is full",
        };
      }

      await redis.setEx(holdKey, REGISTRATION_HOLD_TTL_SECONDS, registrationId);

      await addRegistrationJob({
        id: registrationId,
        userId: user.userId,
        workshopId: workshopId,
        qrCode: qrCode,
        qrCodeUrl: qrCodeUrl,
        registrationStatus,
        paymentStatus,
        idempotencyKey: randomUUID(),
        amount: Number.parseFloat(redis.hget(workshopKey, "price")),
      });

      return true;
    } catch (error) {
      if (slotReserved) {
        try {
          await redis.del(holdKey);
          await redis.incr(slotKey);
        } catch (rollbackError) {
          console.log(rollbackError);
        }
      }

      throw error;
    }
  },
  getAllWorkshopRegisteredStudent: async (workshopId) => {
    try {
      const response =
        await registrationRepository.getAllWorkshopRegisteredStudent(
          workshopId,
        );
      return response;
    } catch (e) {
      throw e;
    }
  },
};
