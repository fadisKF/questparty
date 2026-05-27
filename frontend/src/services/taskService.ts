import type { CreateTaskRequest, KanbanBoard, MoveTaskRequest, Task } from '@/types/api';
import { apiClient } from './apiClient';

export const taskService = {
  kanban: (sprintId: number) =>
    apiClient.get<KanbanBoard>(`/sprints/${sprintId}/kanban`).then((r) => r.data),
  create: (sprintId: number, data: CreateTaskRequest) =>
    apiClient.post<Task>(`/sprints/${sprintId}/tasks`, data).then((r) => r.data),
  move: (taskId: number, data: MoveTaskRequest) =>
    apiClient.patch<Task>(`/tasks/${taskId}/move`, data).then((r) => r.data),
  update: (taskId: number, data: Partial<CreateTaskRequest>) =>
    apiClient.put<Task>(`/tasks/${taskId}`, data).then((r) => r.data),
};
