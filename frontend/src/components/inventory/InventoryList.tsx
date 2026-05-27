import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { CheckCircle2, Crown, PackageCheck, Truck } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/services/apiClient';
import { authService } from '@/services/authService';
import { shopService } from '@/services/shopService';
import { useAuthStore } from '@/store/authStore';
import type { FulfillmentMethod, Purchase } from '@/types/api';
import { fulfillmentMethodLabels, purchaseStatusLabels, shopCategoryLabels, translateText } from '@/utils/labels';

export function InventoryList({ purchases, invalidateKeys }: { purchases: Purchase[]; invalidateKeys: QueryKey[] }) {
  if (!purchases.length) {
    return <p className="text-sm text-muted-foreground">Инвентарь пока пуст. Купленные товары появятся здесь.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {purchases.map((purchase) => (
        <InventoryItemCard key={purchase.id} purchase={purchase} invalidateKeys={invalidateKeys} />
      ))}
    </div>
  );
}

function InventoryItemCard({ purchase, invalidateKeys }: { purchase: Purchase; invalidateKeys: QueryKey[] }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const refresh = async () => {
    invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    if (currentUser?.id === purchase.userId) {
      const profile = await authService.getProfile();
      setUser(profile);
    }
  };

  const chooseFulfillment = useMutation({
    mutationFn: (form: FormData) =>
      shopService.chooseFulfillment(
        purchase.id,
        String(form.get('fulfillmentMethod')) as FulfillmentMethod,
        String(form.get('fulfillmentComment') ?? ''),
      ),
    onSuccess: async () => {
      toast.success('Способ получения сохранён');
      await refresh();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const activateTimeOff = useMutation({
    mutationFn: () => shopService.activateTimeOff(purchase.id),
    onSuccess: async () => {
      toast.success('Отгул активирован');
      await refresh();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const activateProfileFrame = useMutation({
    mutationFn: () => shopService.activateProfileFrame(purchase.id),
    onSuccess: async () => {
      toast.success('Золотая рамка активирована');
      await refresh();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function handleFulfillmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    chooseFulfillment.mutate(new FormData(event.currentTarget));
  }

  const item = purchase.shopItem;
  const isTimeOff = item.category === 'VACATION_HOURS';
  const isProfileCustomization = item.category === 'PROFILE_CUSTOMIZATION';
  const isTimeOffActivated = purchase.status === 'TIME_OFF_ACTIVATED';
  const isFrameActivated = purchase.status === 'PROFILE_FRAME_ACTIVATED';

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-primary/10">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-xl object-cover" />
        ) : isProfileCustomization ? (
          <Crown className="h-10 w-10 text-accent" />
        ) : (
          <PackageCheck className="h-10 w-10 text-primary" />
        )}
      </div>
      <CardHeader>
        <CardTitle>{translateText(item.name)}</CardTitle>
        <CardDescription>
          {shopCategoryLabels[item.category]} · {purchase.quantity} шт. · {purchase.totalPrice} монет
        </CardDescription>
      </CardHeader>
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            {purchaseStatusLabels[purchase.status]}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-muted-foreground">
            {fulfillmentMethodLabels[purchase.fulfillmentMethod]}
          </span>
        </div>

        {isTimeOff ? (
          <Button className="w-full" onClick={() => activateTimeOff.mutate()} disabled={isTimeOffActivated || activateTimeOff.isPending}>
            <CheckCircle2 className="h-4 w-4" />
            {isTimeOffActivated ? 'Отгул уже активирован' : 'Активировать отгул'}
          </Button>
        ) : isProfileCustomization ? (
          <Button className="w-full" onClick={() => activateProfileFrame.mutate()} disabled={isFrameActivated || activateProfileFrame.isPending}>
            <Crown className="h-4 w-4" />
            {isFrameActivated ? 'Золотая рамка уже активирована' : 'Активировать золотую рамку'}
          </Button>
        ) : (
          <form onSubmit={handleFulfillmentSubmit} className="space-y-2 rounded-lg border border-card-border bg-black/20 p-3">
            <label className="text-xs text-muted-foreground">Способ получения</label>
            <select
              name="fulfillmentMethod"
              defaultValue={purchase.fulfillmentMethod === 'DELIVERY' ? 'DELIVERY' : 'PICKUP'}
              className="h-9 w-full rounded-lg border border-card-border bg-black/30 px-2 text-sm"
            >
              <option value="PICKUP">Самовывоз</option>
              <option value="DELIVERY">Доставка</option>
            </select>
            <Input
              name="fulfillmentComment"
              defaultValue={purchase.fulfillmentComment ?? ''}
              placeholder="Комментарий: адрес доставки или удобное время"
              maxLength={500}
            />
            <Button size="sm" type="submit" className="w-full" disabled={chooseFulfillment.isPending}>
              <Truck className="h-4 w-4" />
              Сохранить получение
            </Button>
          </form>
        )}
        <p className="text-xs text-muted-foreground">Куплено: {new Date(purchase.createdAt).toLocaleString()}</p>
        {purchase.activatedAt && <p className="text-xs text-muted-foreground">Активировано: {new Date(purchase.activatedAt).toLocaleString()}</p>}
      </div>
    </Card>
  );
}
