import { Link } from 'react-router-dom';
import type { UserSummary } from '@/types/api';
import { cn } from '@/utils/cn';
import { UserAvatar } from './UserAvatar';

type UserLinkValue = Pick<UserSummary, 'id' | 'displayName' | 'level' | 'avatarUrl' | 'goldenAvatarFrameActive'>;

export function UserLink({ user, className, withAvatar = false }: { user: UserLinkValue; className?: string; withAvatar?: boolean }) {
  return (
    <Link
      to={`/users/${user.id}`}
      className={cn('inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline', className)}
    >
      {withAvatar && <UserAvatar user={user} size="xs" />}
      <span>{user.displayName}{typeof user.level === 'number' ? ` · ур. ${user.level}` : ''}</span>
    </Link>
  );
}
