import { api } from "./api";

export const checkinService = {
  checkin: async (staffId, registrationId, workshopId) => {
    try {
      const response = await api.post(`/api/checkin/${workshopId}`, {
        staffId,
        registrationId,
      });

      return response?.data?.success ?? false;
    } catch (e) {
      console.log(e);
      return false;
    }
  },

  syncCheckinData: async (staffId, checkinData) => {
    try {
      //console.log(data);
      const response = await api.post("/api/checkin", {
        staffId,
        checkinData,
      });

      return response?.data?.success ?? false;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};
