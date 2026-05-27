package com.questparty.service;

import com.questparty.domain.entity.Sprint;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.Role;
import com.questparty.dto.response.PurchaseResponse;
import com.questparty.dto.response.SprintResponse;
import com.questparty.dto.response.UserProfileResponse;
import com.questparty.dto.response.UserSummaryResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.PurchaseRepository;
import com.questparty.repository.SprintMemberRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final SprintMemberRepository sprintMemberRepository;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));

        boolean extendedView = SecurityUtils.getCurrentUser().getRole() == Role.ADMIN
                || SecurityUtils.getCurrentUserId().equals(userId);

        List<PurchaseResponse> inventory = extendedView
                ? purchaseRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .map(entityMapper::toPurchaseResponse)
                        .toList()
                : List.of();

        List<SprintResponse> sprints = extendedView
                ? sprintMemberRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .map(member -> toSprintResponse(member.getSprint()))
                        .toList()
                : List.of();

        return new UserProfileResponse(
                entityMapper.toUserResponse(user),
                inventory,
                sprints,
                extendedView
        );
    }

    private SprintResponse toSprintResponse(Sprint sprint) {
        List<UserSummaryResponse> members = sprintMemberRepository.findBySprintId(sprint.getId()).stream()
                .map(member -> entityMapper.toUserSummary(member.getUser()))
                .toList();
        return entityMapper.toSprintResponse(sprint, members);
    }
}
