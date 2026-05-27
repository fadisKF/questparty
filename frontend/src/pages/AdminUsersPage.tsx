import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/services/adminService';
import { getApiErrorMessage } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import type { Role, User } from '@/types/api';
import { roleDescriptions, roleLabels } from '@/utils/labels';
import { UserLink } from '@/components/users/UserLink';

const roles: Role[] = ['EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN'];

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.listUsers,
    enabled: currentUser?.role === 'ADMIN',
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Role }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('Роль пользователя обновлена');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Права участников
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Администратор может назначать обычных участников, Quest Master и других администраторов.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle>{roleLabels[role]}</CardTitle>
              <CardDescription>{roleDescriptions[role]}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-accent" />
            Управление пользователями
          </CardTitle>
          <CardDescription>
            После смены роли пользователю желательно выйти и войти заново, чтобы токен авторизации обновился.
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr className="border-b border-card-border">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Пользователь</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Прогресс</th>
                <th className="px-3 py-3">Текущая роль</th>
                <th className="px-3 py-3">Новая роль</th>
                <th className="px-3 py-3">Действие</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <UserRoleRow
                  key={user.id}
                  user={user}
                  currentUserId={currentUser.id}
                  isPending={updateRole.isPending}
                  onChangeRole={(role) => updateRole.mutate({ userId: user.id, role })}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function UserRoleRow({
  user,
  currentUserId,
  isPending,
  onChangeRole,
}: {
  user: User;
  currentUserId: number;
  isPending: boolean;
  onChangeRole: (role: Role) => void;
}) {
  const isSelf = user.id === currentUserId;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const role = String(new FormData(event.currentTarget).get('role')) as Role;
    if (role !== user.role) {
      onChangeRole(role);
    } else {
      toast.info('Эта роль уже назначена');
    }
  }

  return (
    <tr className="border-b border-card-border/70 last:border-0">
      <td className="px-3 py-3 text-muted-foreground">#{user.id}</td>
      <td className="px-3 py-3 font-medium"><UserLink user={user} /></td>
      <td className="px-3 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-3 py-3 text-muted-foreground">ур. {user.level} · {user.coins} монет</td>
      <td className="px-3 py-3">
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{roleLabels[user.role]}</span>
      </td>
      <td className="px-3 py-3">
        <form id={`role-form-${user.id}`} onSubmit={handleSubmit} className="flex items-center gap-2">
          <select
            name="role"
            defaultValue={user.role}
            disabled={isSelf}
            className="h-9 min-w-48 rounded-lg border border-card-border bg-black/30 px-2 text-sm"
          >
            {roles.map((role) => (
              <option key={role} value={role}>{roleLabels[role]}</option>
            ))}
          </select>
        </form>
        {isSelf && <p className="mt-1 text-xs text-muted-foreground">Себе роль менять нельзя</p>}
      </td>
      <td className="px-3 py-3">
        <Button size="sm" form={`role-form-${user.id}`} type="submit" disabled={isPending || isSelf}>
          Сохранить
        </Button>
      </td>
    </tr>
  );
}
