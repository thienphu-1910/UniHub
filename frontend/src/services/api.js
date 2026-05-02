import axios from "axios";
import { userStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 100000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url;

    if (url.includes("/signin") || url.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    const errorData = error.response?.data;
    if (
      errorData?.code === "API_KEY_INVALID" ||
      errorData?.code === "API_KEY_MISSING"
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/api/refresh-token", {}, {});
        return api(originalRequest);
      } catch (refreshError) {
        // ✅ Gọi API logout để server xoá cookie
        try {
          await api.post("/api/logout");
        } catch (_) {
          // ignore
        }

        // ✅ Dùng getState() thay vì hook
        userStore.getState().clearUser();

        // ✅ Dispatch event để App.jsx xử lý điều hướng
        window.dispatchEvent(
          new CustomEvent("unauthorized-access", {
            detail: {
              message: "Your session has expired. Please login again!",
            },
          }),
        );

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
