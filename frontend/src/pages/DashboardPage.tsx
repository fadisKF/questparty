import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Coins, Loader2, Medal, Sparkles, Swords, Trophy, Zap } from 'lucide-react';
import { useEffect, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/services/dashboardService';
import { notificationService } from '@/services/notificationService';
import { useAuthStore } from '@/store/authStore';
import { translateRewardMessage, translateText } from '@/utils/labels';
import { UserLink } from '@/components/users/UserLink';
import { UserAvatar } from '@/components/users/UserAvatar';

export function DashboardPage() {
  const storedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get(),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
  });

  const user = dashboard?.currentUser ?? storedUser;

  useEffect(() => {
    if (dashboard?.currentUser) {
      setUser(dashboard.currentUser);
    }
  }, [dashboard?.currentUser, setUser]);

  const xpToNext = Math.max(100, user?.level ? Math.round(100 * Math.pow(1.5, user.level - 1)) : 100);
  const xpProgress = user ? Math.min(100, ((user.experiencePoints % xpToNext) / xpToNext) * 100) : 0;
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  if (isLoading && !user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          {user && <UserAvatar user={user} size="md" />}
          <h1 className="text-3xl font-bold">
            Штаб героя: {user ? <Link to={`/users/${user.id}`} className="text-gradient hover:underline">{user.displayName}</Link> : <span className="text-gradient">герой</span>}
          </h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          Здесь видно уровень, валюту, прогресс задач, уведомления и рейтинг гильдии.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Swords} label="Уровень" value={String(user?.level ?? 1)} accent />
        <StatCard icon={Zap} label="Опыт" value={String(user?.experiencePoints ?? 0)} />
        <StatCard icon={Coins} label="Монеты" value={String(user?.coins ?? 0)} />
        <StatCard icon={Trophy} label="Мои выполненные" value={String(dashboard?.userTasksCompleted ?? 0)} />
        <StatCard icon={Bell} label="Новых событий" value={String(unread)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Прогресс до следующего уровня
            </CardTitle>
            <CardDescription>
              Опыт: {user?.experiencePoints ?? 0}; следующий порог примерно {xpToNext}
            </CardDescription>
          </CardHeader>
          <div className="h-3 overflow-hidden rounded-full bg-black/40">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/projects">
              <Button>Открыть квесты</Button>
            </Link>
            <Link to="/shop">
              <Button variant="secondary">Потратить монеты</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-accent" />
              Лидерборд
            </CardTitle>
            <CardDescription>Топ участников по опыту</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {dashboard?.leaderboard?.slice(0, 5).map((entry) => (
              <div key={entry.userId} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm">
                <span className="font-medium">#{entry.rank} <UserLink user={{ id: entry.userId, displayName: entry.displayName, level: entry.level }} /></span>
                <span className="text-muted-foreground">ур. {entry.level} · {entry.experiencePoints} опыта</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние события</CardTitle>
          <CardDescription>Назначения задач, сообщения, покупки, достижения и завершение квестов.</CardDescription>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {notifications?.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-lg border border-card-border bg-black/20 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-medium">{translateText(item.title)}</p>
                {!item.read && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">Новое</span>}
              </div>
              <p className="text-sm text-muted-foreground">{translateRewardMessage(item.message)}</p>
            </div>
          ))}
          {!notifications?.length && <p className="text-sm text-muted-foreground">Уведомлений пока нет.</p>}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? 'border-primary/30' : undefined}>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/15 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
