package com.questparty.dto.response;

import com.questparty.domain.enums.SprintStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record SprintResponse(
        Long id,
        Long projectId,
        String title,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        SprintStatus status,
        Integer rewardCoins,
        Integer rewardXp,
        boolean rewardClaimed,
        List<UserSummaryResponse> partyMembers,
        Instant createdAt
) {
}
