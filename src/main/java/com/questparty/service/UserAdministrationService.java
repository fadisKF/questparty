package com.questparty.service;

import com.questparty.domain.entity.User;
import com.questparty.domain.enums.Role;
import com.questparty.dto.request.UpdateUserRoleRequest;
import com.questparty.dto.request.AdminAdjustUserStatsRequest;
import com.questparty.dto.response.UserResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAdministrationService {

    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId))
                .map(entityMapper::toUserResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateRole(Long userId, UpdateUserRoleRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId.equals(userId)) {
            throw ApiException.badRequest("Нельзя менять роль собственной учетной записи");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        Role newRole = request.role();
        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw ApiException.badRequest("Нельзя удалить роль у последнего администратора");
        }
        user.setRole(newRole);
        return entityMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse addStats(Long userId, AdminAdjustUserStatsRequest request) {
        long coins = request.safeCoins();
        long experiencePoints = request.safeExperiencePoints();
        if (coins == 0 && experiencePoints == 0) {
            throw ApiException.badRequest("Укажите количество монет или опыта больше нуля");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        gamificationService.adjustStats(user, experiencePoints, coins);
        notificationService.create(
                user,
                com.questparty.domain.enums.NotificationType.LEVEL_UP,
                "Администратор начислил награду",
                "+" + experiencePoints + " опыта, +" + coins + " монет",
                "USER",
                user.getId()
        );
        return entityMapper.toUserResponse(user);
    }
}
