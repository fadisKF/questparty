import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, RegisterRequest } from '@/types/api';
import { getApiErrorMessage } from '@/services/apiClient';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      queryClient.clear();
      setAuth(response.accessToken, response.user);
      navigate('/', { replace: true });
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      queryClient.clear();
      setAuth(response.accessToken, response.user);
      navigate('/', { replace: true });
    },
  });
}

export function useAuthError(error: unknown): string | null {
  if (!error) return null;
  return getApiErrorMessage(error);
}
