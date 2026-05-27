import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api';
import { apiClient } from './apiClient';

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  getProfile: () => apiClient.get<User>('/auth/profile').then((r) => r.data),

  updateProfile: (data: Partial<Pick<User, 'displayName' | 'avatarUrl' | 'bio'>>) =>
    apiClient.put<User>('/auth/profile', data).then((r) => r.data),
};
