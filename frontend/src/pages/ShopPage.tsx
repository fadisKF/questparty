import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Coins, Edit3, Loader2, PackagePlus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import { shopService } from '@/services/shopService';
import { useAuthStore } from '@/store/authStore';
import type { ShopCategory, ShopItem } from '@/types/api';
import { shopCategoryLabels, translateText } from '@/utils/labels';

const categoryLabels = shopCategoryLabels;
const categories = Object.keys(categoryLabels) as ShopCategory[];

export function ShopPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [category, setCategory] = useState<ShopCategory | 'ALL'>('ALL');

  const { data: items, isLoading } = useQuery({
    queryKey: ['shop-items'],
    queryFn: shopService.list,
  });

  const purchase = useMutation({
    mutationFn: (item: ShopItem) => shopService.purchase({ shopItemId: item.id, quantity: 1 }),
    onSuccess: async () => {
      toast.success('Покупка оформлена');
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      const profile = await authService.getProfile();
      setUser(profile);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const createItem = useMutation({
    mutationFn: (form: FormData) =>
      shopService.create({
        name: String(form.get('name') ?? ''),
        description: String(form.get('description') ?? ''),
        price: Number(form.get('price')),
        stock: Number(form.get('stock')),
        imageUrl: String(form.get('imageUrl') ?? ''),
        category: String(form.get('category') ?? 'MERCH') as ShopCategory,
      }),
    onSuccess: () => {
      toast.success('Предмет добавлен в магазин');
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      setShowCreate(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createItem.mutate(new FormData(e.currentTarget));
    e.currentTarget.reset();
  }

  const isAdmin = user?.role === 'ADMIN';
  const visibleItems = items?.filter((item) => category === 'ALL' || item.category === category) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Игровой магазин</h1>
          <p className="text-sm text-muted-foreground">
            Тратьте внутреннюю валюту на мерч, бейджи, кастомизацию и бонусы.
          </p>
          {isAdmin && <p className="mt-1 text-xs text-muted-foreground">Администратор видит также скрытые товары и может редактировать каталог.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
            {user?.coins ?? 0} монет
          </span>
          <Link to="/inventory">
            <Button variant="ghost">Мой инвентарь</Button>
          </Link>
          {isAdmin && (
            <Button variant="secondary" onClick={() => setShowCreate((v) => !v)}>
              <PackagePlus className="h-4 w-4" />
              Добавить товар
            </Button>
          )}
        </div>
      </div>

      {showCreate && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Новый товар</CardTitle>
            <CardDescription>Доступно только администратору.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input name="name" required maxLength={150} placeholder="Футболка QuestParty" />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <CategorySelect />
            </div>
            <Input name="description" placeholder="Описание" />
            <Input name="imageUrl" placeholder="URL картинки" />
            <Input name="price" type="number" min={1} required placeholder="Цена" />
            <Input name="stock" type="number" min={0} defaultValue={10} required placeholder="Остаток" />
            <Button type="submit" disabled={createItem.isPending} className="md:col-span-2">Сохранить товар</Button>
          </form>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={category === 'ALL' ? 'default' : 'secondary'} onClick={() => setCategory('ALL')}>Все</Button>
        {categories.map((cat) => (
          <Button key={cat} size="sm" variant={category === cat ? 'default' : 'secondary'} onClick={() => setCategory(cat)}>
            {categoryLabels[cat]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              canBuy={item.active && item.stock > 0 && !purchase.isPending && (user?.coins ?? 0) >= item.price}
              onBuy={() => purchase.mutate(item)}
            />
          ))}
          {!visibleItems.length && <p className="text-sm text-muted-foreground">В этой категории пока нет товаров.</p>}
        </div>
      )}
    </div>
  );
}

function CategorySelect({ defaultValue }: { defaultValue?: ShopCategory }) {
  return (
    <select name="category" defaultValue={defaultValue} className="h-10 w-full rounded-lg border border-card-border bg-black/30 px-3 text-sm">
      {categories.map((cat) => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
    </select>
  );
}

function ShopItemCard({
  item,
  isAdmin,
  canBuy,
  onBuy,
}: {
  item: ShopItem;
  isAdmin: boolean;
  canBuy: boolean;
  onBuy: () => void;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const updateItem = useMutation({
    mutationFn: (form: FormData) =>
      shopService.update(item.id, {
        name: String(form.get('name') ?? ''),
        description: String(form.get('description') ?? ''),
        price: Number(form.get('price')),
        stock: Number(form.get('stock')),
        imageUrl: String(form.get('imageUrl') ?? ''),
        category: String(form.get('category') ?? 'MERCH') as ShopCategory,
        active: form.get('active') === 'true',
      }),
    onSuccess: () => {
      toast.success('Товар обновлён');
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      setIsEditing(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteItem = useMutation({
    mutationFn: () => shopService.delete(item.id),
    onSuccess: () => {
      toast.success('Товар скрыт из магазина');
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateItem.mutate(new FormData(e.currentTarget));
  }

  function handleDelete() {
    if (window.confirm(`Удалить товар «${translateText(item.name)}» из магазина? Покупки пользователей останутся в инвентаре.`)) {
      deleteItem.mutate();
    }
  }

  return (
    <Card className={`flex flex-col ${!item.active ? 'opacity-60' : ''}`}>
      {isEditing ? (
        <form onSubmit={handleEdit} className="grid gap-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Редактирование товара</CardTitle>
            <Button type="button" size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input name="name" defaultValue={item.name} required maxLength={150} placeholder="Название" />
          <CategorySelect defaultValue={item.category} />
          <Input name="description" defaultValue={item.description ?? ''} placeholder="Описание" />
          <Input name="imageUrl" defaultValue={item.imageUrl ?? ''} placeholder="URL картинки" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input name="price" type="number" min={1} defaultValue={item.price} required placeholder="Цена" />
            <Input name="stock" type="number" min={0} defaultValue={item.stock} required placeholder="Остаток" />
          </div>
          <select name="active" defaultValue={String(item.active)} className="h-10 rounded-lg border border-card-border bg-black/30 px-3 text-sm">
            <option value="true">Активен в магазине</option>
            <option value="false">Скрыт из магазина</option>
          </select>
          <Button type="submit" disabled={updateItem.isPending}>Сохранить изменения</Button>
        </form>
      ) : (
        <>
          <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-xl object-cover" />
            ) : (
              <ShoppingBag className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardHeader>
            <CardTitle>{translateText(item.name)}</CardTitle>
            <CardDescription>{item.description ? translateText(item.description) : categoryLabels[item.category]}</CardDescription>
          </CardHeader>
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1 text-accent">
                <Coins className="h-4 w-4" /> {item.price}
              </span>
              <span className="text-muted-foreground">остаток: {item.stock}</span>
            </div>
            {!item.active && <div className="rounded-full bg-destructive/15 px-2 py-1 text-xs text-destructive">Скрыт из магазина</div>}
            <Button className="w-full" disabled={!canBuy} onClick={onBuy}>Купить</Button>
            {isAdmin && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4" />
                  Редактировать
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteItem.isPending || !item.active}>
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
