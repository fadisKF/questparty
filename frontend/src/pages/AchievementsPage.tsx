import { useQuery } from '@tanstack/react-query';
import { Coins, Loader2, Lock, Sparkles, Trophy } from 'lucide-react';
import { achievementService } from '@/services/achievementService';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { translateAchievementDescription, translateAchievementTitle } from '@/utils/labels';

export function AchievementsPage() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: achievementService.listMine,
  });

  const unlocked = achievements?.filter((item) => item.unlocked).length ?? 0;
  const total = achievements?.length ?? 0;

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
        <h1 className="text-2xl font-bold">Достижения</h1>
        <p className="text-sm text-muted-foreground">
          Открыто {unlocked} из {total}. Достижения дают бонусный опыт и монеты.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {achievements?.map((achievement) => (
          <Card
            key={achievement.id}
            className={achievement.unlocked ? 'border-accent/40' : 'opacity-70'}
          >
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                {achievement.unlocked ? <Trophy className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
              </div>
              <CardTitle>{translateAchievementTitle(achievement.code, achievement.title)}</CardTitle>
              <CardDescription>{translateAchievementDescription(achievement.code, achievement.description)}</CardDescription>
            </CardHeader>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
                <Sparkles className="h-4 w-4" /> +{achievement.xpBonus} опыта
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-accent">
                <Coins className="h-4 w-4" /> +{achievement.coinsBonus}
              </span>
            </div>
            {achievement.unlockedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Получено: {new Date(achievement.unlockedAt).toLocaleString()}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
