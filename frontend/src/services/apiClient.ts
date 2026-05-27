import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody } from '@/types/api';
import { storage } from '@/utils/storage';
import { translateApiMessage } from '@/utils/labels';

const baseURL = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8080/api`;

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      storage.clearAuth();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return 'Нет соединения с API. Проверьте, что backend запущен на http://localhost:8080/api и CORS разрешает текущий адрес сайта.';
    }
    return translateApiMessage(error.response.data?.message ?? error.message);
  }
  if (error instanceof Error) return error.message;
  return 'Неизвестная ошибка';
}
