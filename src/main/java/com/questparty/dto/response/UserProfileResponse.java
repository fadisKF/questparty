package com.questparty.dto.response;

import java.util.List;

public record UserProfileResponse(
        UserResponse user,
        List<PurchaseResponse> inventory,
        List<SprintResponse> sprints,
        boolean extendedView
) {
}
