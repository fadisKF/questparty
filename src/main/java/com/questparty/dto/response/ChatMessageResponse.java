package com.questparty.dto.response;

import java.time.Instant;

public record ChatMessageResponse(
        Long id,
        Long sprintId,
        UserSummaryResponse author,
        String content,
        Instant createdAt
) {
}
