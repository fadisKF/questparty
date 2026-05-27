import { UserRound } from 'lucide-react';
import type { User, UserSummary } from '@/types/api';
import { cn } from '@/utils/cn';

type AvatarUser = Pick<UserSummary | User, 'displayName' | 'avatarUrl' | 'goldenAvatarFrameActive'>;

const sizeClasses = {
  xs: 'h-6 w-6 rounded-lg',
  sm: 'h-8 w-8 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-20 w-20 rounded-3xl',
  xl: 'h-24 w-24 rounded-3xl',
};

const iconClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

export function UserAvatar({
  user,
  size = 'md',
  className,
}: {
  user?: AvatarUser | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const activeFrame = Boolean(user?.goldenAvatarFrameActive);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden',
        sizeClasses[size],
        activeFrame ? 'golden-avatar-frame p-[3px]' : 'bg-primary/15 text-primary',
        className,
      )}
      title={activeFrame ? 'Активна золотая рамка аватара' : undefined}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] bg-primary/15 text-primary">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
        ) : (
          <UserRound className={iconClasses[size]} />
        )}
      </div>
    </div>
  );
}
