import type { UserProfile, UserSummary } from '@/types/api';
import { apiClient } from './apiClient';

export const userService = {
  list: () => apiClient.get<UserSummary[]>('/users').then((r) => r.data),
  profile: (id: number) => apiClient.get<UserProfile>(`/users/${id}/profile`).then((r) => r.data),
};
