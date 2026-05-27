package com.questparty.dto.response;

public record UserSummaryResponse(
        Long id,
        String displayName,
        String avatarUrl,
        Integer level,
        boolean goldenAvatarFrameActive
) {
}
