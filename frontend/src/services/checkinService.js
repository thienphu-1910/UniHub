import { api } from "./api";

export const checkinService = {
  checkin: async (registrationId, workshopId) => {
    try {
      const response = await api.post(`/api/checkin/${workshopId}`, {
        registrationId,
      }, {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
      });

      return response?.data?.success ?? false;
    } catch (e) {
      console.log(e);
      console.log("ERROR OVERHERE")
      throw e;
    }
  },

  syncCheckinData: async (checkinData) => {
    try {
      //console.log(data);
      const response = await api.post("/api/checkin", {
        checkinData,
      }, {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
      });

      return response?.data?.success ?? false;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};
