import { userRepository } from "../repositories/user.repository.js";
import { workshopRepository } from "../repositories/workshop.repository.js";
import { uploadToCloudinary } from "../utils/imageUpload.js";
import { summarizeWorkshopPdf } from "./aiSummary.service.js";
import redis from "../config/redis.js";

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

      const registrationStartTime =
        payload.registrationStartTime ?? payload.startTime;
      const registrationEndTime =
        payload.registrationEndTime ?? payload.endTime;

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
        registrationStartTime,
        registrationEndTime,
        capacity: payload.capacity || 0,
        availableSlots: payload.capacity,
        price: payload.price || 0,
        createdBy: userId,
      };

      const response = await workshopRepository.addNewWorkshop(workshopPayload);

      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopList: async (page = 1, limit = 10) => {
    try {
      const setKey = "workshop:index";
      const exists = await redis.exists(setKey);
      const count = await redis.sCard(setKey);

      if (exist === 1 && count > 0) {
        const pipeline = redis.pipeline();
        const ids = pipeline.sMembers(setKey);

        ids.forEach((id) => pipeline.hGetAll(`workshop:${id}`));

        const result = await pipeline.exec();

        return result.map(([err, val]) => val).filter(Boolean);
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
      const key = `workshop:${workshopId}`;
      const slotKey = `workshop:${workshopId}:slots`;
      const exist = await redis.exists(key);
      if (exist) {
        const workshop = await redis.hGet(key);
        const availableSlots = await redis.get(slotKey);
        workshop.price = Number.parseFloat(workshop.price);
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
};
