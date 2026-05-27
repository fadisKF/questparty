package com.questparty.dto.request;

import com.questparty.domain.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record MoveTaskRequest(
        @NotNull TaskStatus status,
        @NotNull Integer position
) {
}
