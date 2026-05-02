import { api } from "./api";

export const registrationService = {
  getRegisteredStudents: async (workshopId) => {
    try {
      const response = await api.get(`/api/registrations/${workshopId}`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
        }
      });

      return response?.data?.data;
    } catch (e) {
      console.log(e);
    }
  }
}