package com.questparty.service;

import com.questparty.config.AppProperties;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.NotificationType;
import com.questparty.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * XP, coins, and level progression logic.
 */
@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepository;
    private final AchievementService achievementService;
    private final NotificationService notificationService;
    private final AppProperties appProperties;

    @Transactional
    public void rewardUser(User user, int xp, int coins) {
        adjustStats(user, xp, coins);
        achievementService.evaluateAfterTaskComplete(user);
    }

    @Transactional
    public void rewardForQuestCompletion(User user, int xp, int coins) {
        adjustStats(user, xp, coins);
        achievementService.evaluateAfterQuestComplete(user);
    }

    @Transactional
    public void adjustStats(User user, long xpDelta, long coinsDelta) {
        user.setExperiencePoints(Math.max(0L, user.getExperiencePoints() + xpDelta));
        user.setCoins(Math.max(0L, user.getCoins() + coinsDelta));
        recalculateLevel(user);
        userRepository.save(user);
    }

    private void recalculateLevel(User user) {
        int previousLevel = user.getLevel();
        int level = 1;
        long remainingXp = user.getExperiencePoints();
        long threshold = xpRequiredForLevel(level);

        while (remainingXp >= threshold) {
            remainingXp -= threshold;
            level++;
            threshold = xpRequiredForLevel(level);
        }

        user.setLevel(level);
        if (level > previousLevel) {
            notificationService.create(
                    user,
                    NotificationType.LEVEL_UP,
                    "Новый уровень!",
                    "Вы достигли уровня " + level,
                    "USER",
                    user.getId()
            );
            achievementService.evaluateAfterLevelUp(user);
        }
    }

    public long xpRequiredForLevel(int level) {
        double base = appProperties.getGamification().getXpPerLevelBase();
        double multiplier = appProperties.getGamification().getLevelMultiplier();
        return Math.round(base * Math.pow(multiplier, level - 1));
    }
}
