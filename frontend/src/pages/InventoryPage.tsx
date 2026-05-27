import { useQuery } from '@tanstack/react-query';
import { Backpack, Loader2 } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryList } from '@/components/inventory/InventoryList';
import { shopService } from '@/services/shopService';

export function InventoryPage() {
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: shopService.inventory,
  });

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
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Backpack className="h-6 w-6 text-primary" />
          Инвентарь
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Здесь хранятся купленные товары. Для мерча можно выбрать самовывоз или доставку, а отгулы можно активировать.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Мои покупки</CardTitle>
          <CardDescription>Все предметы, приобретённые за внутреннюю валюту компании.</CardDescription>
        </CardHeader>
        <InventoryList purchases={inventory} invalidateKeys={[['inventory']]} />
      </Card>
    </div>
  );
}
