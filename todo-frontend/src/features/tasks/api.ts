import axios from 'axios';
import { env } from '@/utils/env';

// Use the deployed backend URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptors to include credentials (cookies) for authentication
api.interceptors.request.use(
  (config) => {
    // Include credentials (cookies) for authentication with every request
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to create API instance that uses the deployed backend
export const createApiWithUserId = (userId: string) => {
  const apiWithUserId = axios.create({
    baseURL: API_BASE_URL,
  });

  // Add the same interceptors to include credentials
  apiWithUserId.interceptors.request.use(
    (config) => {
      // Include credentials (cookies) for authentication with every request
      config.withCredentials = true;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiWithUserId;
};

export default api;
