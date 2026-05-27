package com.questparty.service;

import com.questparty.domain.entity.Project;
import com.questparty.domain.entity.ProjectMember;
import com.questparty.domain.entity.Sprint;
import com.questparty.domain.entity.SprintMember;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.NotificationType;
import com.questparty.domain.enums.PartyRole;
import com.questparty.domain.enums.Role;
import com.questparty.domain.enums.SprintStatus;
import com.questparty.domain.enums.TaskStatus;
import com.questparty.dto.request.CreateSprintRequest;
import com.questparty.dto.request.UpdateSprintRequest;
import com.questparty.dto.response.SprintResponse;
import com.questparty.dto.response.UserSummaryResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.ProjectMemberRepository;
import com.questparty.repository.SprintMemberRepository;
import com.questparty.repository.SprintRepository;
import com.questparty.repository.TaskRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final SprintMemberRepository sprintMemberRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService projectAccessService;

    private final NotificationService notificationService;
    private final AchievementService achievementService;
    private final GamificationService gamificationService;
    private final EntityMapper entityMapper;

    @Transactional
    public SprintResponse create(Long projectId, CreateSprintRequest request) {
        Project project = projectAccessService.requireProject(projectId);
        projectAccessService.requireManagerOrOwner(project);
        if (request.endDate().isBefore(request.startDate())) {
            throw ApiException.badRequest("Дата окончания должна быть позже даты начала");
        }
        Sprint sprint = Sprint.builder()
                .project(project)
                .title(request.title())
                .description(request.description())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .status(SprintStatus.PLANNED)
                .rewardCoins(request.safeRewardCoins())
                .rewardXp(request.safeRewardXp())
                .build();
        sprint = sprintRepository.save(sprint);
        addPartyMemberInternal(sprint, SecurityUtils.getCurrentUserId(), PartyRole.LEADER);
        return toResponse(sprint);
    }

    @Transactional(readOnly = true)
    public List<SprintResponse> listByProject(Long projectId) {
        Project project = projectAccessService.requireProject(projectId);
        projectAccessService.requireAccess(project);
        return sprintRepository.findByProjectIdOrderByStartDateDesc(projectId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SprintResponse getById(Long sprintId) {
        Sprint sprint = requireSprint(sprintId);
        projectAccessService.requireAccess(sprint.getProject());
        return toResponse(sprint);
    }

    @Transactional
    public SprintResponse update(Long sprintId, UpdateSprintRequest request) {
        Sprint sprint = requireSprint(sprintId);
        projectAccessService.requireManagerOrOwner(sprint.getProject());
        if (request.endDate().isBefore(request.startDate())) {
            throw ApiException.badRequest("Дата окончания должна быть позже даты начала");
        }

        SprintStatus previousStatus = sprint.getStatus();
        sprint.setTitle(request.title());
        sprint.setDescription(request.description());
        sprint.setStartDate(request.startDate());
        sprint.setEndDate(request.endDate());
        sprint.setRewardCoins(request.safeRewardCoins());
        sprint.setRewardXp(request.safeRewardXp());

        if (request.status() == SprintStatus.COMPLETED) {
            // Редактирование статуса на «Завершён» должно работать так же,
            // как кнопка «Завершить квест»: проверка задач + начисление награды.
            completeSprint(sprint, previousStatus == SprintStatus.ACTIVE);
        } else {
            sprint.setStatus(request.status());
            if (previousStatus != request.status()) {
                notifyParty(sprint, NotificationType.SPRINT_STARTED, "Статус квеста изменён", sprint.getTitle() + ": " + request.status());
            }
        }
        return toResponse(sprintRepository.save(sprint));
    }

    @Transactional
    public void delete(Long sprintId) {
        Sprint sprint = requireSprint(sprintId);
        projectAccessService.requireManagerOrOwner(sprint.getProject());
        sprintRepository.delete(sprint);
    }

    @Transactional
    public SprintResponse start(Long sprintId) {
        Sprint sprint = requireSprint(sprintId);
        projectAccessService.requireManagerOrOwner(sprint.getProject());
        if (sprint.getStatus() != SprintStatus.PLANNED) {
            throw ApiException.badRequest("Запустить можно только запланированный квест");
        }
        if (sprintMemberRepository.findBySprintId(sprintId).isEmpty()) {
            throw ApiException.badRequest("В party квеста должен быть хотя бы один участник");
        }
        sprint.setStatus(SprintStatus.ACTIVE);
        notifyParty(sprint, NotificationType.SPRINT_STARTED, "Квест начался", sprint.getTitle() + " теперь активен");
        return toResponse(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintResponse complete(Long sprintId) {
        Sprint sprint = requireSprint(sprintId);
        projectAccessService.requireManagerOrOwner(sprint.getProject());
        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw ApiException.badRequest("Завершить кнопкой можно только активный квест. Через редактирование можно изменить статус, но задачи всё равно должны быть выполнены.");
        }
        completeSprint(sprint, true);
        return toResponse(sprintRepository.save(sprint));
    }

    private void completeSprint(Sprint sprint, boolean sendCompletionMessage) {
        validateAllTasksDone(sprint);
        sprint.setStatus(SprintStatus.COMPLETED);
        List<SprintMember> party = sprintMemberRepository.findBySprintId(sprint.getId());
        if (party.isEmpty()) {
            throw ApiException.badRequest("В party квеста должен быть хотя бы один участник для начисления награды");
        }
        grantQuestRewardOnce(sprint, party);
        party.forEach(sm -> achievementService.evaluateAfterQuestComplete(sm.getUser()));
        if (sendCompletionMessage) {
            notifyParty(sprint, NotificationType.SPRINT_COMPLETED, "Квест завершён", sprint.getTitle() + " успешно завершён");
        }
    }

    private void validateAllTasksDone(Sprint sprint) {
        long unfinished = taskRepository.findBySprintIdOrderByStatusAscPositionAsc(sprint.getId()).stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .count();
        if (unfinished > 0) {
            throw ApiException.badRequest("Перед завершением квеста выполните все задачи");
        }
    }

    private void grantQuestRewardOnce(Sprint sprint, List<SprintMember> party) {
        if (sprint.isRewardClaimed()) {
            return;
        }
        int rewardXp = sprint.getRewardXp() == null ? 0 : sprint.getRewardXp();
        int rewardCoins = sprint.getRewardCoins() == null ? 0 : sprint.getRewardCoins();
        if (rewardXp > 0 || rewardCoins > 0) {
            party.forEach(sm -> {
                gamificationService.rewardForQuestCompletion(sm.getUser(), rewardXp, rewardCoins);
                notificationService.create(
                        sm.getUser(),
                        NotificationType.SPRINT_COMPLETED,
                        "Награда за квест начислена",
                        "+" + rewardXp + " опыта, +" + rewardCoins + " монет",
                        "SPRINT",
                        sprint.getId()
                );
            });
        }
        sprint.setRewardClaimed(true);
    }

    @Transactional
    public void addPartyMember(Long sprintId, Long userId) {
        Sprint sprint = requireSprint(sprintId);
        projectAccessService.requireManagerOrOwner(sprint.getProject());
        addPartyMemberInternal(sprint, userId, PartyRole.MEMBER);
    }

    @Transactional
    public SprintResponse joinParty(Long sprintId) {
        Sprint sprint = requireSprint(sprintId);
        projectAccessService.requireAccess(sprint.getProject());
        addPartyMemberInternal(sprint, SecurityUtils.getCurrentUserId(), PartyRole.MEMBER);
        return toResponse(sprint);
    }

    private void addPartyMemberInternal(Sprint sprint, Long userId, PartyRole role) {
        if (sprintMemberRepository.existsBySprintIdAndUserId(sprint.getId(), userId)) {
            throw ApiException.conflict("Пользователь уже состоит в party этого квеста");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        boolean projectMember = user.getRole() == Role.ADMIN
                || sprint.getProject().getOwner().getId().equals(userId)
                || projectMemberRepository.existsByProjectIdAndUserId(sprint.getProject().getId(), userId);
        if (!projectMember) {
            projectMemberRepository.save(ProjectMember.builder()
                    .project(sprint.getProject())
                    .user(user)
                    .build());
        }
        sprintMemberRepository.save(SprintMember.builder()
                .sprint(sprint)
                .user(user)
                .partyRole(role)
                .build());
        notificationService.create(
                user,
                NotificationType.SPRINT_STARTED,
                "Вы добавлены в party квеста",
                sprint.getTitle(),
                "SPRINT",
                sprint.getId()
        );
    }

    public Sprint requireSprint(Long sprintId) {
        return sprintRepository.findById(sprintId)
                .orElseThrow(() -> ApiException.notFound("Квест не найден"));
    }

    private SprintResponse toResponse(Sprint sprint) {
        List<UserSummaryResponse> members = sprintMemberRepository.findBySprintId(sprint.getId()).stream()
                .map(sm -> entityMapper.toUserSummary(sm.getUser()))
                .toList();
        return entityMapper.toSprintResponse(sprint, members);
    }

    private void notifyParty(Sprint sprint, NotificationType type, String title, String message) {
        sprintMemberRepository.findBySprintId(sprint.getId()).forEach(sm ->
                notificationService.create(sm.getUser(), type, title, message, "SPRINT", sprint.getId())
        );
    }
}
