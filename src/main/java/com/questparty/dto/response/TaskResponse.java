package com.questparty.dto.response;

import com.questparty.domain.enums.TaskPriority;
import com.questparty.domain.enums.TaskStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        Long sprintId,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        Integer rewardCoins,
        Integer rewardXp,
        boolean rewardClaimed,
        Integer position,
        UserSummaryResponse assignee,
        LocalDateTime deadline,
        Instant createdAt
) {
}
