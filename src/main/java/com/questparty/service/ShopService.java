package com.questparty.service;

import com.questparty.domain.entity.Purchase;
import com.questparty.domain.entity.ShopItem;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.FulfillmentMethod;
import com.questparty.domain.enums.NotificationType;
import com.questparty.domain.enums.PurchaseStatus;
import com.questparty.domain.enums.Role;
import com.questparty.domain.enums.ShopCategory;
import com.questparty.dto.request.CreateShopItemRequest;
import com.questparty.dto.request.PurchaseFulfillmentRequest;
import com.questparty.dto.request.PurchaseRequest;
import com.questparty.dto.request.UpdateShopItemRequest;
import com.questparty.dto.response.PurchaseResponse;
import com.questparty.dto.response.ShopItemResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.PurchaseRepository;
import com.questparty.repository.ShopItemRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopItemRepository shopItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final AchievementService achievementService;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public List<ShopItemResponse> listItems() {
        boolean isAdmin = SecurityUtils.getCurrentUser().getRole() == Role.ADMIN;
        return (isAdmin
                ? shopItemRepository.findAllByOrderByNameAsc()
                : shopItemRepository.findByActiveTrueOrderByNameAsc()).stream()
                .map(entityMapper::toShopItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> listInventory() {
        return purchaseRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.getCurrentUserId()).stream()
                .map(entityMapper::toPurchaseResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> listInventoryForUser(Long userId) {
        boolean isSelf = SecurityUtils.getCurrentUserId().equals(userId);
        boolean isAdmin = SecurityUtils.getCurrentUser().getRole() == Role.ADMIN;
        if (!isSelf && !isAdmin) {
            throw ApiException.forbidden("Инвентарь другого участника доступен только администратору");
        }
        return purchaseRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(entityMapper::toPurchaseResponse)
                .toList();
    }

    @Transactional
    public ShopItemResponse createItem(CreateShopItemRequest request) {
        requireAdmin();
        ShopItem item = ShopItem.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .stock(request.stock() != null ? request.stock() : 0)
                .imageUrl(request.imageUrl())
                .category(request.category())
                .active(true)
                .build();
        return entityMapper.toShopItemResponse(shopItemRepository.save(item));
    }

    @Transactional
    public ShopItemResponse updateItem(Long itemId, UpdateShopItemRequest request) {
        requireAdmin();
        ShopItem item = shopItemRepository.findById(itemId)
                .orElseThrow(() -> ApiException.notFound("Товар не найден"));
        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setStock(request.stock());
        item.setImageUrl(request.imageUrl());
        item.setCategory(request.category());
        item.setActive(request.active());
        return entityMapper.toShopItemResponse(shopItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long itemId) {
        requireAdmin();
        ShopItem item = shopItemRepository.findById(itemId)
                .orElseThrow(() -> ApiException.notFound("Товар не найден"));
        item.setActive(false);
        shopItemRepository.save(item);
    }

    @Transactional
    public ShopItemResponse purchase(PurchaseRequest request) {
        User user = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        ShopItem item = shopItemRepository.findById(request.shopItemId())
                .orElseThrow(() -> ApiException.notFound("Товар не найден"));

        if (!item.isActive()) {
            throw ApiException.badRequest("Товар недоступен для покупки");
        }
        int quantity = request.quantity() != null ? request.quantity() : 1;
        if (quantity <= 0) {
            throw ApiException.badRequest("Количество должно быть больше нуля");
        }
        if (item.getStock() < quantity) {
            throw new ApiException(
                    com.questparty.exception.ErrorCode.INSUFFICIENT_STOCK,
                    HttpStatus.BAD_REQUEST,
                    "Недостаточно товара на складе"
            );
        }
        long totalPrice = item.getPrice() * quantity;
        if (user.getCoins() < totalPrice) {
            throw new ApiException(
                    com.questparty.exception.ErrorCode.INSUFFICIENT_COINS,
                    HttpStatus.BAD_REQUEST,
                    "Недостаточно монет"
            );
        }

        user.setCoins(user.getCoins() - totalPrice);
        item.setStock(item.getStock() - quantity);
        userRepository.save(user);
        shopItemRepository.save(item);

        purchaseRepository.save(Purchase.builder()
                .user(user)
                .shopItem(item)
                .quantity(quantity)
                .totalPrice(totalPrice)
                .fulfillmentMethod(FulfillmentMethod.NOT_SELECTED)
                .status(PurchaseStatus.OWNED)
                .build());

        achievementService.evaluateAfterPurchase(user);
        notificationService.create(
                user,
                NotificationType.PURCHASE_SUCCESS,
                "Покупка оформлена",
                item.getName() + " x" + quantity,
                "SHOP_ITEM",
                item.getId()
        );
        return entityMapper.toShopItemResponse(item);
    }

    @Transactional
    public PurchaseResponse updateFulfillment(Long purchaseId, PurchaseFulfillmentRequest request) {
        Purchase purchase = requireOwnedPurchase(purchaseId);
        FulfillmentMethod method = request.fulfillmentMethod();
        if (method == FulfillmentMethod.NOT_SELECTED
                || method == FulfillmentMethod.TIME_OFF_ACTIVATION
                || method == FulfillmentMethod.PROFILE_CUSTOMIZATION_ACTIVATION) {
            throw ApiException.badRequest("Для получения товара выберите самовывоз или доставку");
        }
        if (purchase.getShopItem().getCategory() == ShopCategory.VACATION_HOURS) {
            throw ApiException.badRequest("Для отгула используйте действие «Активировать отгул»");
        }
        if (purchase.getShopItem().getCategory() == ShopCategory.PROFILE_CUSTOMIZATION) {
            throw ApiException.badRequest("Для оформления профиля используйте действие «Активировать золотую рамку»");
        }
        purchase.setFulfillmentMethod(method);
        purchase.setStatus(PurchaseStatus.FULFILLMENT_REQUESTED);
        purchase.setFulfillmentComment(request.fulfillmentComment());
        return entityMapper.toPurchaseResponse(purchaseRepository.save(purchase));
    }

    @Transactional
    public PurchaseResponse activateTimeOff(Long purchaseId) {
        Purchase purchase = requireOwnedPurchase(purchaseId);
        if (purchase.getShopItem().getCategory() != ShopCategory.VACATION_HOURS) {
            throw ApiException.badRequest("Активировать как отгул можно только товар категории «Отгулы»");
        }
        if (purchase.getStatus() == PurchaseStatus.TIME_OFF_ACTIVATED) {
            throw ApiException.badRequest("Этот отгул уже активирован");
        }
        purchase.setFulfillmentMethod(FulfillmentMethod.TIME_OFF_ACTIVATION);
        purchase.setStatus(PurchaseStatus.TIME_OFF_ACTIVATED);
        purchase.setActivatedAt(Instant.now());
        purchase.setFulfillmentComment("Пользователь активировал отгул");
        return entityMapper.toPurchaseResponse(purchaseRepository.save(purchase));
    }

    @Transactional
    public PurchaseResponse activateProfileFrame(Long purchaseId) {
        Purchase purchase = requireOwnedPurchase(purchaseId);
        ShopItem item = purchase.getShopItem();
        if (!isGoldenAvatarFrame(item)) {
            throw ApiException.badRequest("Этот предмет нельзя активировать как золотую рамку аватара");
        }
        if (purchase.getStatus() == PurchaseStatus.PROFILE_FRAME_ACTIVATED) {
            throw ApiException.badRequest("Золотая рамка уже активирована");
        }

        User user = purchase.getUser();
        user.setGoldenAvatarFrameActive(true);
        userRepository.save(user);

        purchase.setFulfillmentMethod(FulfillmentMethod.PROFILE_CUSTOMIZATION_ACTIVATION);
        purchase.setStatus(PurchaseStatus.PROFILE_FRAME_ACTIVATED);
        purchase.setActivatedAt(Instant.now());
        purchase.setFulfillmentComment("Пользователь активировал золотую рамку аватара");
        Purchase saved = purchaseRepository.save(purchase);

        notificationService.create(
                user,
                NotificationType.PURCHASE_SUCCESS,
                "Золотая рамка активирована",
                "Рамка отображается вокруг аватара",
                "PURCHASE",
                purchase.getId()
        );
        return entityMapper.toPurchaseResponse(saved);
    }

    private boolean isGoldenAvatarFrame(ShopItem item) {
        if (item.getCategory() != ShopCategory.PROFILE_CUSTOMIZATION) {
            return false;
        }
        String name = item.getName() == null ? "" : item.getName().toLowerCase(java.util.Locale.ROOT);
        return name.contains("golden avatar frame")
                || name.contains("золот")
                || name.contains("рамк");
    }

    private Purchase requireOwnedPurchase(Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> ApiException.notFound("Предмет инвентаря не найден"));
        boolean isOwner = purchase.getUser().getId().equals(SecurityUtils.getCurrentUserId());
        boolean isAdmin = SecurityUtils.getCurrentUser().getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw ApiException.forbidden("Нет доступа к этому предмету инвентаря");
        }
        return purchase;
    }

    private void requireAdmin() {
        if (SecurityUtils.getCurrentUser().getRole() != Role.ADMIN) {
            throw ApiException.forbidden("Доступно только администратору");
        }
    }
}
