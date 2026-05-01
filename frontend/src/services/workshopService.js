import { api } from "./api";

export const workshopService = {
  addNewWorkshop: async (formData) => {
    try {
      const response = await api.post('/api/workshop', formData, {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY,
          "Content-Type": "multipart/form-data"
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
  }
}