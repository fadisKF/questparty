import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  Backpack,
  Trophy,
  User,
  LogOut,
  Swords,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { roleLabels } from '@/utils/labels';
import { UserAvatar } from '@/components/users/UserAvatar';
import { useQueryClient } from '@tanstack/react-query';

const baseNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Панель управления' },
  { to: '/projects', icon: FolderKanban, label: 'Проекты' },
  { to: '/shop', icon: ShoppingBag, label: 'Магазин' },
  { to: '/inventory', icon: Backpack, label: 'Инвентарь' },
  { to: '/achievements', icon: Trophy, label: 'Достижения' },
  { to: '/profile', icon: User, label: 'Профиль' },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  }

  const navItems = user?.role === 'ADMIN'
    ? [...baseNavItems, { to: '/admin/users', icon: ShieldCheck, label: 'Права участников' }]
    : baseNavItems;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-card-border glass-card rounded-none md:flex">
        <div className="flex items-center gap-2 border-b border-card-border p-6">
          <Swords className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-gradient">QuestParty</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-card-border p-4">
          <div className="mb-3 px-2 text-xs text-muted-foreground">
            Ур. {user?.level ?? 1} · {user?.coins ?? 0} монет
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-card-border px-6 glass-card rounded-none">
          <p className="text-sm text-muted-foreground md:hidden">QuestParty</p>
          <div className="flex items-center gap-3">
            {user && <UserAvatar user={user} size="sm" />}
            <NavLink to={user ? `/users/${user.id}` : '/profile'} className="font-medium hover:text-primary">{user?.displayName}</NavLink>
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
              {user?.role ? roleLabels[user.role] : ''}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
