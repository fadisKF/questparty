import type { AdminAdjustUserStatsRequest, Role, UpdateUserRoleRequest, User } from '@/types/api';
import { apiClient } from './apiClient';

export const adminService = {
  listUsers: () => apiClient.get<User[]>('/admin/users').then((r) => r.data),
  updateUserRole: (userId: number, role: Role) =>
    apiClient.patch<User>(`/admin/users/${userId}/role`, { role } satisfies UpdateUserRoleRequest).then((r) => r.data),
  addUserStats: (userId: number, data: AdminAdjustUserStatsRequest) =>
    apiClient.patch<User>(`/admin/users/${userId}/stats`, data).then((r) => r.data),
};
