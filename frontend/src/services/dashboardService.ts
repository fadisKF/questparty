import type { Dashboard } from '@/types/api';
import { apiClient } from './apiClient';

export const dashboardService = {
  get: (sprintId?: number) =>
    apiClient
      .get<Dashboard>('/analytics/dashboard', { params: sprintId ? { sprintId } : undefined })
      .then((r) => r.data),
};
