package com.questparty.service;

import com.questparty.domain.entity.Achievement;
import com.questparty.domain.entity.User;
import com.questparty.domain.entity.UserAchievement;
import com.questparty.domain.enums.AchievementCode;
import com.questparty.domain.enums.NotificationType;
import com.questparty.domain.enums.TaskStatus;
import com.questparty.dto.response.AchievementResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.AchievementRepository;
import com.questparty.repository.TaskRepository;
import com.questparty.repository.UserAchievementRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public List<AchievementResponse> getMyAchievements() {
        Long userId = SecurityUtils.getCurrentUserId();
        Set<Long> unlockedIds = userAchievementRepository.findByUserIdOrderByUnlockedAtDesc(userId).stream()
                .map(ua -> ua.getAchievement().getId())
                .collect(Collectors.toSet());

        return achievementRepository.findAll().stream()
                .map(a -> {
                    boolean unlocked = unlockedIds.contains(a.getId());
                    Instant unlockedAt = userAchievementRepository.findByUserIdOrderByUnlockedAtDesc(userId).stream()
                            .filter(ua -> ua.getAchievement().getId().equals(a.getId()))
                            .map(UserAchievement::getUnlockedAt)
                            .findFirst()
                            .orElse(null);
                    return entityMapper.toAchievementResponse(a, unlocked, unlockedAt);
                })
                .toList();
    }

    @Transactional
    public void evaluateAfterTaskComplete(User user) {
        long doneCount = taskRepository.countByAssigneeIdAndStatus(user.getId(), TaskStatus.DONE);
        if (doneCount >= 1) unlock(user, AchievementCode.FIRST_TASK);
        if (doneCount >= 10) unlock(user, AchievementCode.TASKS_10);
        if (doneCount >= 50) unlock(user, AchievementCode.TASKS_50);
        if (user.getCoins() >= 100) unlock(user, AchievementCode.COINS_100);
        if (user.getCoins() >= 500) unlock(user, AchievementCode.COINS_500);
    }

    @Transactional
    public void evaluateAfterLevelUp(User user) {
        if (user.getLevel() >= 5) unlock(user, AchievementCode.LEVEL_5);
        if (user.getLevel() >= 10) unlock(user, AchievementCode.LEVEL_10);
    }

    @Transactional
    public void evaluateAfterPurchase(User user) {
        unlock(user, AchievementCode.SHOP_FIRST_PURCHASE);
    }

    @Transactional
    public void evaluateAfterQuestComplete(User user) {
        unlock(user, AchievementCode.SPRINT_HERO);
    }

    @Transactional
    public void unlockAchievement(User user, AchievementCode code) {
        unlock(user, code);
    }

    private void unlock(User user, AchievementCode code) {
        Achievement achievement = achievementRepository.findByCode(code)
                .orElse(null);
        if (achievement == null) {
            return;
        }
        if (userAchievementRepository.existsByUserIdAndAchievementId(user.getId(), achievement.getId())) {
            return;
        }
        userAchievementRepository.save(UserAchievement.builder()
                .user(user)
                .achievement(achievement)
                .unlockedAt(Instant.now())
                .build());

        user.setExperiencePoints(user.getExperiencePoints() + achievement.getXpBonus());
        user.setCoins(user.getCoins() + achievement.getCoinsBonus());
        userRepository.save(user);

        notificationService.create(
                user,
                NotificationType.ACHIEVEMENT_UNLOCKED,
                "Achievement unlocked",
                achievement.getTitle(),
                "ACHIEVEMENT",
                achievement.getId()
        );
    }

    public Achievement requireByCode(AchievementCode code) {
        return achievementRepository.findByCode(code)
                .orElseThrow(() -> ApiException.notFound("Achievement not found: " + code));
    }
}
