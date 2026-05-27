package com.questparty.dto.response;

import com.questparty.domain.enums.FulfillmentMethod;
import com.questparty.domain.enums.PurchaseStatus;

import java.time.Instant;

public record PurchaseResponse(
        Long id,
        Long userId,
        String userName,
        ShopItemResponse shopItem,
        Integer quantity,
        Long totalPrice,
        FulfillmentMethod fulfillmentMethod,
        PurchaseStatus status,
        String fulfillmentComment,
        Instant activatedAt,
        Instant createdAt
) {
}
