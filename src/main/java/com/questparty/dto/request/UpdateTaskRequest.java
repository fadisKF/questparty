package com.questparty.dto.request;

import com.questparty.domain.enums.TaskPriority;
import com.questparty.domain.enums.TaskStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateTaskRequest(
        @Size(max = 200) String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        Integer rewardCoins,
        Integer rewardXp,
        Long assigneeId,
        LocalDateTime deadline
) {
}
