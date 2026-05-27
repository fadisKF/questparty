import type { ChatMessage } from '@/types/api';
import { apiClient } from './apiClient';

export const chatService = {
  history: (sprintId: number) =>
    apiClient.get<ChatMessage[]>(`/sprints/${sprintId}/chat`).then((r) => r.data),
  send: (sprintId: number, content: string) =>
    apiClient.post<ChatMessage>(`/sprints/${sprintId}/chat`, { content }).then((r) => r.data),
};
