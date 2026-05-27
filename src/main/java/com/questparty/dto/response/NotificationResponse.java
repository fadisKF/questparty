package com.questparty.dto.response;

import com.questparty.domain.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        boolean read,
        String relatedEntityType,
        Long relatedEntityId,
        Instant createdAt
) {
}
