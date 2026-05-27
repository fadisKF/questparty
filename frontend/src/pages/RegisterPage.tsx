import { AuthForm } from '@/components/auth/AuthForm';
import { useAuthError, useRegister } from '@/hooks/useAuth';
import type { RegisterRequest } from '@/types/api';

export function RegisterPage() {
  const register = useRegister();
  const error = useAuthError(register.error);

  return (
    <AuthForm
      mode="register"
      error={error}
      onSubmit={async (data) => {
        await register.mutateAsync({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
        } as RegisterRequest);
      }}
    />
  );
}
