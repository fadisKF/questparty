package com.questparty.dto.response;

public record LeaderboardEntryResponse(
        int rank,
        Long userId,
        String displayName,
        Integer level,
        Long experiencePoints,
        Long coins
) {
}
