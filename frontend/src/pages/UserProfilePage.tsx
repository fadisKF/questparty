import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Backpack, CalendarDays, Coins, Gift, Loader2, Shield, Sparkles } from 'lucide-react';
import type { ComponentType, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryList } from '@/components/inventory/InventoryList';
import { userService } from '@/services/userService';
import { adminService } from '@/services/adminService';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import { roleLabels, sprintStatusLabels, translateText } from '@/utils/labels';
import { UserAvatar } from '@/components/users/UserAvatar';
import { useAuthStore } from '@/store/authStore';

export function UserProfilePage() {
  const params = useParams();
  const userId = Number(params.userId);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userService.profile(userId),
    enabled: Boolean(userId),
  });

  const addStats = useMutation({
    mutationFn: (form: FormData) =>
      adminService.addUserStats(userId, {
        coins: Number(form.get('coins')) || 0,
        experiencePoints: Number(form.get('experiencePoints')) || 0,
      }),
    onSuccess: async () => {
      toast.success('Награда начислена пользователю');
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (currentUser?.id === userId) {
        const updated = await authService.getProfile();
        setUser(updated);
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleAddStats(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addStats.mutate(new FormData(e.currentTarget));
    e.currentTarget.reset();
  }

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = profile.user;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start gap-5">
          <UserAvatar user={user} size="xl" />
          <div className="min-w-0 flex-1">
            <CardHeader>
              <CardTitle className="text-2xl">{user.displayName}</CardTitle>
              <CardDescription>{user.bio || 'Описание профиля пока не заполнено.'}</CardDescription>
            </CardHeader>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric icon={Shield} label="Роль" value={roleLabels[user.role]} />
              <Metric icon={Sparkles} label="Уровень" value={String(user.level)} />
              <Metric icon={Sparkles} label="Опыт" value={String(user.experiencePoints)} />
              <Metric icon={Coins} label="Монеты" value={String(user.coins)} />
            </div>
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent" />
              Начислить валюту или опыт
            </CardTitle>
            <CardDescription>Администратор может добавить пользователю внутреннюю валюту и опыт.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddStats} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label>Монеты</Label>
              <Input name="coins" type="number" min={0} defaultValue={0} placeholder="Например: 5000" />
            </div>
            <div className="space-y-2">
              <Label>Опыт</Label>
              <Input name="experiencePoints" type="number" min={0} defaultValue={0} placeholder="Например: 500" />
            </div>
            <Button type="submit" disabled={addStats.isPending} className="self-end">Начислить</Button>
          </form>
        </Card>
      )}

      {profile.extendedView ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Backpack className="h-5 w-5 text-primary" />
                Инвентарь участника
              </CardTitle>
              <CardDescription>Доступно владельцу профиля и администраторам.</CardDescription>
            </CardHeader>
            <InventoryList purchases={profile.inventory} invalidateKeys={[[ 'user-profile', userId ]]} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-accent" />
                Участие в квестах/спринтах
              </CardTitle>
              <CardDescription>Квесты-спринты, где пользователь состоит в party.</CardDescription>
            </CardHeader>
            <div className="space-y-3">
              {profile.sprints.map((sprint) => (
                <Link key={sprint.id} to={`/sprints/${sprint.id}/kanban`} className="block rounded-lg border border-card-border bg-black/20 p-3 hover:border-primary/50">
                  <div className="font-medium">{translateText(sprint.title)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {sprintStatusLabels[sprint.status]} · {sprint.startDate} — {sprint.endDate} · {sprint.partyMembers.length} участников
                  </div>
                </Link>
              ))}
              {!profile.sprints.length && <p className="text-sm text-muted-foreground">Пользователь пока не состоит в квестах.</p>}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <CardDescription>Инвентарь и список квестов видны только владельцу профиля и администраторам.</CardDescription>
        </Card>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/20 p-3">
      <dt className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
