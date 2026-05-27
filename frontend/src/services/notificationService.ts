import type { Notification } from '@/types/api';
import { apiClient } from './apiClient';

export const notificationService = {
  list: () => apiClient.get<Notification[]>('/notifications').then((r) => r.data),
  markRead: (id: number) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),
};
