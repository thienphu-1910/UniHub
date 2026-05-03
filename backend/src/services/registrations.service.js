import { registrationsRepository } from "../repositories/registrations.repository.js";

export const registrationsService = {
  getAllWorkshopRegisteredStudent: async (workshopId) => {
    try {
      const response = await registrationsRepository.getAllWorkshopRegisteredStudent(workshopId);
      return response;
    } catch (e) {
      throw e;
    }
  }
};