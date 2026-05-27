package com.questparty.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 80) String displayName,
        @Size(max = 500) String avatarUrl,
        @Size(max = 500) String bio
) {
}
