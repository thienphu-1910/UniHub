import { api } from "./api";

export const authenticationService = {
  signIn: async (email, password) => {
    try {
      const response = await api.post(`/api/signin`, {
        email,
        password,
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json',
        }
      });

      if (response?.data?.data?.user) {
        return {
          isAuthenticated: true,
          user: response.data.data.user,
        };
      }

      return { isAuthenticated: false };
    } catch (e) {
      console.log(e);

      return {
        isAuthenticated: false,
      }
    }
  }
}

