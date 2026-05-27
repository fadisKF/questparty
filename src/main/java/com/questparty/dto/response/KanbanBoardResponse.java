package com.questparty.dto.response;

import com.questparty.domain.enums.TaskStatus;

import java.util.Map;

public record KanbanBoardResponse(
        Long sprintId,
        Map<TaskStatus, java.util.List<TaskResponse>> columns
) {
}
