package com.questparty.service;

import com.questparty.domain.entity.User;
import com.questparty.domain.enums.TaskStatus;
import com.questparty.dto.response.DashboardResponse;
import com.questparty.dto.response.LeaderboardEntryResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.TaskRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long sprintId) {
        Long userId = SecurityUtils.getCurrentUserId();
        User current = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));

        long userDone = taskRepository.countByAssigneeIdAndStatus(userId, TaskStatus.DONE);
        long sprintTotal = 0;
        long sprintDone = 0;
        if (sprintId != null) {
            sprintTotal = taskRepository.findBySprintIdOrderByStatusAscPositionAsc(sprintId).size();
            sprintDone = taskRepository.countBySprintIdAndStatus(sprintId, TaskStatus.DONE);
        }

        double progress = sprintTotal == 0 ? 0.0 : (sprintDone * 100.0) / sprintTotal;

        List<LeaderboardEntryResponse> leaderboard = new ArrayList<>();
        int rank = 1;
        for (User u : userRepository.findLeaderboard()) {
            leaderboard.add(new LeaderboardEntryResponse(
                    rank++,
                    u.getId(),
                    u.getDisplayName(),
                    u.getLevel(),
                    u.getExperiencePoints(),
                    u.getCoins()
            ));
            if (rank > 10) break;
        }

        return new DashboardResponse(
                taskRepository.count(),
                userDone,
                progress,
                leaderboard,
                entityMapper.toUserResponse(current)
        );
    }
}
