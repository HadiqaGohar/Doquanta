import axios from 'axios';
import { env } from '@/utils/env';

// Use the frontend proxy routes instead of calling backend directly
const API_BASE_URL = ''; // Empty string since we're using Next.js app router proxy routes

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

// Function to create API instance that uses the proxy routes
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
