import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/unihub/api",
  timeout: 100000,
});
