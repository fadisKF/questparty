package com.questparty.dto.request;

import com.questparty.domain.enums.ShopCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateShopItemRequest(
        @NotBlank @Size(max = 150) String name,
        String description,
        @NotNull @Min(1) Long price,
        @NotNull @Min(0) Integer stock,
        String imageUrl,
        @NotNull ShopCategory category,
        boolean active
) {
}
