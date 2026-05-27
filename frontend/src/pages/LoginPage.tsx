import { AuthForm } from '@/components/auth/AuthForm';
import { useAuthError, useLogin } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types/api';

export function LoginPage() {
  const login = useLogin();
  const error = useAuthError(login.error);

  return (
    <AuthForm
      mode="login"
      error={error}
      onSubmit={async (data) => {
        await login.mutateAsync({
          email: data.email,
          password: data.password,
        } as LoginRequest);
      }}
    />
  );
}
