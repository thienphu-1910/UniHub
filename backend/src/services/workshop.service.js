import { userRepository } from "../repositories/user.repository.js";
import { workshopRepository } from "../repositories/workshop.repository.js";
import { uploadToCloudinary } from "../utils/imageUpload.js";

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

      const workshopPayload = {
        title: payload.title || "",
        description: payload.description || "",
        aiSummary: payload.aiSummary || "",
        summaryStatus: payload.summaryStatus || "none",
        speaker: {
          name: payload.speakerName || "",
          bio: payload.speakerBio || "",
          avatarUrl: speakerAvatarUrl || null,
        },
        room: payload.room || "",
        roomDiagram: payload.roomDiagram || {},
        startTime: payload.startTime,
        endTime: payload.endTime,
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
      const response = await workshopRepository.getWorkshopList(page, limit);
      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopDetail: async (workshopId) => {
    try {
      const response = await workshopRepository.getWorkshopDetail(workshopId);
      return response;
    } catch (e) {
      throw e;
    }
  },
};
