import { checkinRepository } from "../repositories/checkin.repository.js";
import { registrationRepository } from "../repositories/registration.repository.js";

export const checkinService = {
  checkin: async ({ staffId, registrationId, workshopId }) => {
    try {
      const regWorkshopId =
        await registrationRepository.findWorkshopId(registrationId);
      if (regWorkshopId?.workshopId !== workshopId) return {
        success: false,
        code: "REGISTRATION_NOT_FOUND",
        message: "Can not found registration"
      };

      await checkinRepository.checkin(staffId, registrationId);
      
      return {
        success: true,
        code: "CHECKIN_SUCCESS",
        message: "Checkin success",
      };
      
    } catch (e) {
      throw e;
    }
  },
  synchronizeCheckinData: async (staffId, checkinData) => {
    try {
      await checkinRepository.synchronizeCheckinData(staffId, checkinData);
      return {
        succes: true,
        message: "Synchronized successfully",
      };
    } catch (e) {
      throw e;
    }
  },
};
