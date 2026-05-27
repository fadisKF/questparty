package com.questparty.dto.request;

import jakarta.validation.constraints.Min;

public record AdminAdjustUserStatsRequest(
        @Min(0) Long coins,
        @Min(0) Long experiencePoints
) {
    public long safeCoins() {
        return coins == null ? 0L : coins;
    }

    public long safeExperiencePoints() {
        return experiencePoints == null ? 0L : experiencePoints;
    }
}
