package com.questparty.dto.response;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        Long ownerId,
        String ownerName,
        boolean active,
        Instant createdAt
) {
}
