package com.questparty.dto.response;

import com.questparty.domain.enums.AchievementCode;

import java.time.Instant;

public record AchievementResponse(
        Long id,
        AchievementCode code,
        String title,
        String description,
        String iconUrl,
        Integer xpBonus,
        Integer coinsBonus,
        boolean unlocked,
        Instant unlockedAt
) {
}
