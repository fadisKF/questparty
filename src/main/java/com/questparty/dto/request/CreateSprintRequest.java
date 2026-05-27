package com.questparty.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateSprintRequest(
        @NotBlank @Size(max = 150) String title,
        String description,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @Min(0) Integer rewardCoins,
        @Min(0) Integer rewardXp
) {
    public int safeRewardCoins() {
        return rewardCoins == null ? 0 : rewardCoins;
    }

    public int safeRewardXp() {
        return rewardXp == null ? 0 : rewardXp;
    }
}
