package com.questparty.dto.response;

import java.util.List;

public record DashboardResponse(
        long totalTasksCompleted,
        long userTasksCompleted,
        double sprintProgressPercent,
        List<LeaderboardEntryResponse> leaderboard,
        UserResponse currentUser
) {
}
