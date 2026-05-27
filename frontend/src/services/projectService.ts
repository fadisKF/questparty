import type { CreateProjectRequest, Project, Sprint } from '@/types/api';
import { apiClient } from './apiClient';

export const projectService = {
  list: () => apiClient.get<Project[]>('/projects').then((r) => r.data),
  get: (id: number) => apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (data: CreateProjectRequest) =>
    apiClient.post<Project>('/projects', data).then((r) => r.data),
  delete: (id: number) => apiClient.delete<void>(`/projects/${id}`).then((r) => r.data),
  addMember: (projectId: number, userId: number) =>
    apiClient.post<void>(`/projects/${projectId}/members/${userId}`).then((r) => r.data),
  listSprints: (projectId: number) =>
    apiClient.get<Sprint[]>(`/projects/${projectId}/sprints`).then((r) => r.data),
};
