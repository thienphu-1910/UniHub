import { userRoles } from "../enums/role.enum.js";
import { usersRepository } from "../repositories/users.repository.js";
import { workshopsRepository } from "../repositories/workshops.repository.js";

export const workshopsService = {
  addNewWorkshop: async (payload, userId) => {
    try {
      const { role } = await usersRepository.getUserViaId(userId);;
      if (role !== userRoles.ORGANIZER) {
        return null;
      }

      const workshopPayload = {
        title: payload.title || "",
        description: payload.description || "",
        aiSummary: payload.aiSummary || "",
        summaryStatus: payload.summaryStatus || "none",
        speaker: payload.speaker || {},
        room: payload.room || "",
        roomDiagram: payload.roomDiagram || {},
        startTime: payload.startTime,
        endTime: payload.endTime,
        capacity: payload.capacity || 0,
        availableSlots: payload.availableSlots,
        price: payload.price || 0,
        createdBy: userId,
      };

      const response = await workshopsRepository.addNewWorkshop(workshopPayload);

      return response;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}