import type { Achievement } from '@/types/api';
import { apiClient } from './apiClient';

export const achievementService = {
  listMine: () => apiClient.get<Achievement[]>('/achievements/me').then((r) => r.data),
};
