package com.questparty.dto.response;

import com.questparty.domain.enums.Role;

public record UserResponse(
        Long id,
        String email,
        String displayName,
        Role role,
        Integer level,
        Long experiencePoints,
        Long coins,
        String avatarUrl,
        String bio,
        boolean goldenAvatarFrameActive
) {
}
