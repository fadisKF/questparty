import { useMutation } from '@tanstack/react-query';
import { Coins, Save, Shield, Sparkles } from 'lucide-react';
import { type ComponentType, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import { roleLabels } from '@/utils/labels';
import { UserAvatar } from '@/components/users/UserAvatar';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const updateProfile = useMutation({
    mutationFn: (form: FormData) =>
      authService.updateProfile({
        displayName: String(form.get('displayName') ?? ''),
        avatarUrl: String(form.get('avatarUrl') ?? ''),
        bio: String(form.get('bio') ?? ''),
      }),
    onSuccess: (profile) => {
      setUser(profile);
      toast.success('Профиль обновлён');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateProfile.mutate(new FormData(e.currentTarget));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <UserAvatar user={user} size="lg" className="mb-3" />
          <CardTitle>{user?.displayName}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Metric icon={Shield} label="Роль" value={user?.role ? roleLabels[user.role] : '—'} />
          <Metric icon={Sparkles} label="Уровень" value={String(user?.level ?? 1)} />
          <Metric icon={Sparkles} label="Опыт" value={String(user?.experiencePoints ?? 0)} />
          <Metric icon={Coins} label="Монеты" value={String(user?.coins ?? 0)} />
        </dl>
        {user?.bio && <p className="mt-4 rounded-lg bg-black/20 p-3 text-sm text-muted-foreground">{user.bio}</p>}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Редактировать героя</CardTitle>
          <CardDescription>Имя, аватар и био видны в команде квеста и карточках задач.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label>Имя героя</Label>
            <Input name="displayName" defaultValue={user?.displayName ?? ''} required minLength={2} maxLength={80} />
          </div>
          <div className="space-y-2">
            <Label>URL аватара</Label>
            <Input name="avatarUrl" defaultValue={user?.avatarUrl ?? ''} maxLength={500} />
          </div>
          <div className="space-y-2">
            <Label>Био</Label>
            <textarea
              name="bio"
              defaultValue={user?.bio ?? ''}
              maxLength={500}
              rows={5}
              className="w-full rounded-lg border border-card-border bg-black/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Например: frontend-разработчик, люблю рейды по багам."
            />
          </div>
          <Button type="submit" disabled={updateProfile.isPending}>
            <Save className="h-4 w-4" />
            Сохранить
          </Button>
        </form>
      </Card>
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
