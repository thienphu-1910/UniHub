import { randomUUID } from "node:crypto";
import redis from "../config/redis.js";
import {
  REGISTRATION_HOLD_TTL_SECONDS,
  buildMockPaymentUrl,
} from "../config/registration.js";
import { registrationRepository } from "../repositories/registration.repository.js";
import {
  getWorkshopSlotsKey,
  workshopCacheService,
} from "./workshopCache.service.js";

const REGISTRATION_STATUS_PENDING = "PENDING";

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

    const cachedWorkshop = await workshopCacheService.getCachedWorkshop(
      workshopId,
    );

    if (!cachedWorkshop) {
      return {
        success: false,
        statusCode: 409,
        code: "WORKSHOP_REGISTRATION_NOT_READY",
        message: "Workshop registration is not ready",
      };
    }

    const now = Date.now();
    const registrationStartMs = new Date(
      cachedWorkshop.registrationStartTime,
    ).getTime();
    const registrationEndMs = new Date(
      cachedWorkshop.registrationEndTime,
    ).getTime();

    if (Number.isNaN(registrationStartMs) || Number.isNaN(registrationEndMs)) {
      return {
        success: false,
        statusCode: 409,
        code: "WORKSHOP_REGISTRATION_NOT_READY",
        message: "Workshop registration window is not ready",
      };
    }

    if (now < registrationStartMs) {
      return {
        success: false,
        statusCode: 409,
        code: "WORKSHOP_REGISTRATION_NOT_OPEN",
        message: "Workshop registration is not open yet",
      };
    }

    if (now > registrationEndMs) {
      return {
        success: false,
        statusCode: 409,
        code: "WORKSHOP_REGISTRATION_CLOSED",
        message: "Workshop registration is closed",
      };
    }

    const hasCachedSlots = await workshopCacheService.hasCachedSlots(
      workshopId,
    );
    if (!hasCachedSlots) {
      return {
        success: false,
        statusCode: 409,
        code: "WORKSHOP_SLOTS_NOT_READY",
        message: "Workshop slots are not ready",
      };
    }

    const slotKey = getWorkshopSlotsKey(workshopId);
    const holdKey = `slot:hold:${workshopId}:${user.studentId}`;
    const registrationId = randomUUID();
    const registeredAt = new Date();
    const qrCode = `MOCK_VIETQR:${registrationId}`;
    const qrCodeUrl = buildMockPaymentUrl({
      registrationId,
      workshopId,
      studentId: user.studentId,
    });

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

      const registration = await registrationRepository.createRegistration({
        id: registrationId,
        userId: user.userId,
        workshopId,
        status: REGISTRATION_STATUS_PENDING,
        qrCode,
        qrCodeUrl,
        registeredAt,
      });

      if (!registration) {
        throw new Error("Failed to persist registration");
      }

      return {
        success: true,
        registration,
        paymentUrl: qrCodeUrl,
      };
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
