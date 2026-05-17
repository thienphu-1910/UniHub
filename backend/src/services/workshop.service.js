import { userRepository } from "../repositories/user.repository.js";
import { workshopRepository } from "../repositories/workshop.repository.js";
import { scheduleWorkshopCacheJob } from "../jobs/queues/workshopCache.queue.js";
import { uploadToCloudinary } from "../utils/imageUpload.js";
import { summarizeWorkshopPdf } from "./aiSummary.service.js";
import redis from "../config/redis.js";
import {
  WORKSHOP_CACHE_INDEX_KEY,
  getWorkshopInfoKey,
  getWorkshopSlotsKey,
  workshopCacheService,
} from "./workshopCache.service.js";

const DEFAULT_REGISTRATION_OFFSET_DAYS = 3;

const resolveRegistrationWindow = ({
  startTime,
  registrationStartTime,
  registrationEndTime,
}) => {
  const workshopStartTime = new Date(startTime);
  const resolvedRegistrationEndTime = registrationEndTime
    ? new Date(registrationEndTime)
    : workshopStartTime;
  const resolvedRegistrationStartTime = registrationStartTime
    ? new Date(registrationStartTime)
    : new Date(
        resolvedRegistrationEndTime.getTime() -
          DEFAULT_REGISTRATION_OFFSET_DAYS * 24 * 60 * 60 * 1000,
      );

  if (resolvedRegistrationStartTime >= resolvedRegistrationEndTime) {
    throw new Error("Registration start time must be before end time");
  }

  if (resolvedRegistrationEndTime > workshopStartTime) {
    throw new Error("Registration end time must be before workshop start time");
  }

  return {
    registrationStartTime: resolvedRegistrationStartTime,
    registrationEndTime: resolvedRegistrationEndTime,
  };
};

export const workshopService = {
  addNewWorkshop: async (payload, userId) => {
    try {
      const user = await userRepository.getUserViaId(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const speakerAvatar = payload.speakerAvatar;
      let speakerAvatarUrl = null;
      if (speakerAvatar) {
        const uploadResult = await uploadToCloudinary(speakerAvatar.buffer);
        speakerAvatarUrl = uploadResult.secure_url;
      }

      const pdfSummaryResult = await summarizeWorkshopPdf(payload.pdfFile);
      const aiSummary = pdfSummaryResult.summary || "";
      const summaryStatus = pdfSummaryResult.status || "failed";

      const workshopPayload = {
        title: payload.title || "",
        description: payload.description || "",
        aiSummary,
        summaryStatus,
        speaker: {
          name: payload.speakerName || "",
          bio: payload.speakerBio || "",
          avatarUrl: speakerAvatarUrl || null,
        },
        room: payload.room || "",
        roomDiagram: payload.roomDiagram || {},
        startTime: payload.startTime,
        endTime: payload.endTime,
        ...resolveRegistrationWindow({
          startTime: payload.startTime,
          registrationStartTime: payload.registrationStartTime,
          registrationEndTime: payload.registrationEndTime,
        }),
        capacity: payload.capacity || 0,
        availableSlots: payload.capacity,
        isPaid: Number.parseFloat(payload.price || 0) > 0,
        price: payload.price || 0,
        createdBy: userId,
      };

      const response = await workshopRepository.addNewWorkshop(workshopPayload);
      if (response) {
        await scheduleWorkshopCacheJob({
          workshopId: response.id ?? response.workshopId,
          registrationStartTime: response.registrationStartTime,
        });
      }

      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopList: async (page = 1, limit = 10) => {
    try {
      const exists = await redis.exists(WORKSHOP_CACHE_INDEX_KEY);
      const count = await redis.sCard(WORKSHOP_CACHE_INDEX_KEY);

      if (exists === 1 && count > 0) {
        const workshops = await workshopCacheService.getCachedWorkshops();
        const offset = (page - 1) * limit;
        const list = workshops.slice(offset, offset + limit);
        const totalPage = Math.max(1, Math.ceil(workshops.length / limit));

        ids.forEach((id) => {
          multi.hGetAll(`workshop-${id}`);
        });

        const result = await multi.exec();

        return result.filter(Boolean);
      }

      const response = await workshopRepository.getWorkshopList(page, limit);
      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopDetail: async (workshopId) => {
    try {
      const key = getWorkshopInfoKey(workshopId);
      const slotKey = getWorkshopSlotsKey(workshopId);
      const exist = await redis.exists(key);
      if (exist) {
        const workshop =
          await workshopCacheService.getCachedWorkshop(workshopId);
        const availableSlots = await redis.get(slotKey);
        return {
          ...workshop,
          availableSlots,
        };
      }

      const response = await workshopRepository.getWorkshopDetail(workshopId);
      return response;
    } catch (e) {
      throw e;
    }
  },

  updateWorkshop: async(id, payload) => {
    try {
      console.log(id, payload);
      const result = await workshopRepository.updateWorkshop(id, payload);
      
      return result;
    } catch (e) {
      throw e;
    }
  },

  deactivatingWorkshop: async (id) => {
    try {
      await workshopRepository.deactivatingWorkshop(id);

    } catch (e) {
      throw e;
    }
  }
};
