package com.questparty.dto.request;

import com.questparty.domain.enums.FulfillmentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PurchaseFulfillmentRequest(
        @NotNull FulfillmentMethod fulfillmentMethod,
        @Size(max = 500) String fulfillmentComment
) {
}
