import type { CreateShopItemRequest, FulfillmentMethod, Purchase, PurchaseRequest, ShopItem, UpdateShopItemRequest } from '@/types/api';
import { apiClient } from './apiClient';

export const shopService = {
  list: () => apiClient.get<ShopItem[]>('/shop/items').then((r) => r.data),
  create: (data: CreateShopItemRequest) =>
    apiClient.post<ShopItem>('/shop/items', data).then((r) => r.data),
  update: (itemId: number, data: UpdateShopItemRequest) =>
    apiClient.put<ShopItem>(`/shop/items/${itemId}`, data).then((r) => r.data),
  delete: (itemId: number) => apiClient.delete<void>(`/shop/items/${itemId}`).then((r) => r.data),
  purchase: (data: PurchaseRequest) =>
    apiClient.post<ShopItem>('/shop/purchase', data).then((r) => r.data),
  inventory: () => apiClient.get<Purchase[]>('/shop/inventory').then((r) => r.data),
  inventoryForUser: (userId: number) => apiClient.get<Purchase[]>(`/shop/inventory/users/${userId}`).then((r) => r.data),
  chooseFulfillment: (purchaseId: number, fulfillmentMethod: FulfillmentMethod, fulfillmentComment?: string) =>
    apiClient.patch<Purchase>(`/shop/inventory/${purchaseId}/fulfillment`, { fulfillmentMethod, fulfillmentComment }).then((r) => r.data),
  activateTimeOff: (purchaseId: number) =>
    apiClient.patch<Purchase>(`/shop/inventory/${purchaseId}/activate-time-off`).then((r) => r.data),
  activateProfileFrame: (purchaseId: number) =>
    apiClient.patch<Purchase>(`/shop/inventory/${purchaseId}/activate-profile-frame`).then((r) => r.data),
};
