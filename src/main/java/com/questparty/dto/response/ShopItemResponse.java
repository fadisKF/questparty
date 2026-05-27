package com.questparty.dto.response;

import com.questparty.domain.enums.ShopCategory;

public record ShopItemResponse(
        Long id,
        String name,
        String description,
        Long price,
        Integer stock,
        String imageUrl,
        ShopCategory category,
        boolean active
) {
}
