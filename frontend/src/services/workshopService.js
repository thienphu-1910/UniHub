import { api } from "./api";

export const workshopService = {
  addNewWorkshop: async (formData) => {
    try {
      const response = await api.post('/api/workshops', formData, {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
          //"Content-Type": "multipart/form-data"
        }
      });

      return {
        success: true,
        data: response?.data,
      };
    } catch (e) {
      console.log(e);
      return {
        success: false,
      }
    }
  },

  getWorkshopList: async (page, limit) => {
    try {
      const response = await api.get(
        "/api/workshops",
        {
          params: { page, limit },
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY,
          },
        }
      );

      return response?.data?.data;
    } catch (e) {
      console.log(e);
    }
  },

  getWorkshopDetail: async (workshopId) => {
    try {
      const response = await api.get(`/api/workshops/${workshopId}`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      });
      return response?.data?.data;

    } catch (e) {
      console.log(e);
    }
  }
}