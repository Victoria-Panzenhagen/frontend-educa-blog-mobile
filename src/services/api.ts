
import { create } from "axios";
import * as SecureStore from "expo-secure-store";

export const api = create({
  baseURL: "https://post-api-7n8w.onrender.com/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// https://post-api-7n8w.onrender.com/docs#/Posts/PostController_findOne
