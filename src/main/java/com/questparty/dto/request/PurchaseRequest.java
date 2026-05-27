package com.questparty.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PurchaseRequest(
        @NotNull Long shopItemId,
        @Min(1) Integer quantity
) {
}
