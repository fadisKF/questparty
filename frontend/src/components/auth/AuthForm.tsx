import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: Record<string, string>) => Promise<void>;
  error?: string | null;
}

export function AuthForm({ mode, onSubmit, error }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-primary/20 shadow-2xl shadow-primary/10">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <Swords className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl text-gradient">QuestParty</CardTitle>
        <CardDescription>
          {isLogin ? 'Войдите в свой квест-отряд' : 'Создайте героя и начните квест'}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="displayName">Имя героя</Label>
            <Input id="displayName" name="displayName" required minLength={2} maxLength={80} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Нет аккаунта?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Регистрация
              </Link>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Войти
              </Link>
            </>
          )}
        </p>
      </form>
    </Card>
  );
}
