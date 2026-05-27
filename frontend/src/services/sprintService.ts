import type { CreateSprintRequest, Sprint, UpdateSprintRequest } from '@/types/api';
import { apiClient } from './apiClient';

export const sprintService = {
  get: (id: number) => apiClient.get<Sprint>(`/sprints/${id}`).then((r) => r.data),
  create: (projectId: number, data: CreateSprintRequest) =>
    apiClient.post<Sprint>(`/projects/${projectId}/sprints`, data).then((r) => r.data),
  update: (id: number, data: UpdateSprintRequest) =>
    apiClient.put<Sprint>(`/sprints/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete<void>(`/sprints/${id}`).then((r) => r.data),
  start: (id: number) => apiClient.post<Sprint>(`/sprints/${id}/start`).then((r) => r.data),
  complete: (id: number) => apiClient.post<Sprint>(`/sprints/${id}/complete`).then((r) => r.data),
  join: (id: number) => apiClient.post<Sprint>(`/sprints/${id}/party/join`).then((r) => r.data),
  addPartyMember: (id: number, userId: number) =>
    apiClient.post<void>(`/sprints/${id}/party/${userId}`).then((r) => r.data),
};
