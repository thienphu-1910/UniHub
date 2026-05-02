import { usersRepository } from "../repositories/users.repository.js";
import { workshopsRepository } from "../repositories/workshops.repository.js";
import { uploadToCloudinary } from "../utils/imageUpload.js";

export const workshopsService = {
  addNewWorkshop: async (payload, userId) => {
    try {
      const user = await usersRepository.getUserViaId(userId);;
      if (!user) {
        throw new Error('User not found');
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

      const response = await workshopsRepository.addNewWorkshop(workshopPayload);

      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopList: async (page = 1, limit = 10) => {
    try {
      const response = await workshopsRepository.getWorkshopList(page, limit);
      return response;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopDetail: async (workshopId) => {
    try {
      const response = await workshopsRepository.getWorkshopDetail(workshopId);
      return response;
    } catch (e) {
      throw e;
    }
  }
}