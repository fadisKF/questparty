package com.questparty.service;

import com.questparty.domain.entity.Sprint;
import com.questparty.domain.entity.Task;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.NotificationType;
import com.questparty.domain.enums.TaskStatus;
import com.questparty.dto.request.CreateTaskRequest;
import com.questparty.dto.request.MoveTaskRequest;
import com.questparty.dto.request.UpdateTaskRequest;
import com.questparty.dto.response.KanbanBoardResponse;
import com.questparty.dto.response.TaskResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.SprintMemberRepository;
import com.questparty.repository.TaskRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SprintMemberRepository sprintMemberRepository;
    private final SprintService sprintService;
    private final ProjectAccessService projectAccessService;
    private final GamificationService gamificationService;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    @Transactional
    public TaskResponse create(Long sprintId, CreateTaskRequest request) {
        Sprint sprint = sprintService.requireSprint(sprintId);
        projectAccessService.requireAccess(sprint.getProject());

        TaskStatus status = request.status() != null ? request.status() : TaskStatus.BACKLOG;
        int position = taskRepository.findMaxPositionInColumn(sprintId, status) + 1;

        Task task = Task.builder()
                .sprint(sprint)
                .title(request.title())
                .description(request.description())
                .status(status)
                .priority(request.priority() != null ? request.priority() : com.questparty.domain.enums.TaskPriority.MEDIUM)
                .rewardCoins(request.rewardCoins() != null ? request.rewardCoins() : 10)
                .rewardXp(request.rewardXp() != null ? request.rewardXp() : 25)
                .position(position)
                .assignee(resolveAssignee(request.assigneeId(), sprint))
                .deadline(request.deadline())
                .build();

        task = taskRepository.save(task);
        if (task.getAssignee() != null) {
            notificationService.create(
                    task.getAssignee(),
                    NotificationType.TASK_ASSIGNED,
                    "Назначена новая миссия",
                    task.getTitle(),
                    "TASK",
                    task.getId()
            );
        }
        if (task.getStatus() == TaskStatus.DONE) {
            onTaskCompleted(task);
        }
        return entityMapper.toTaskResponse(task);
    }

    @Transactional(readOnly = true)
    public KanbanBoardResponse getKanbanBoard(Long sprintId) {
        Sprint sprint = sprintService.requireSprint(sprintId);
        projectAccessService.requireAccess(sprint.getProject());

        List<Task> tasks = taskRepository.findBySprintIdOrderByStatusAscPositionAsc(sprintId);
        Map<TaskStatus, List<TaskResponse>> columns = Arrays.stream(TaskStatus.values())
                .collect(Collectors.toMap(
                        status -> status,
                        status -> tasks.stream()
                                .filter(t -> t.getStatus() == status)
                                .map(entityMapper::toTaskResponse)
                                .toList(),
                        (a, b) -> a,
                        () -> new EnumMap<>(TaskStatus.class)
                ));
        return new KanbanBoardResponse(sprintId, columns);
    }

    @Transactional
    public TaskResponse update(Long taskId, UpdateTaskRequest request) {
        Task task = requireTask(taskId);
        projectAccessService.requireAccess(task.getSprint().getProject());

        if (request.title() != null) task.setTitle(request.title());
        if (request.description() != null) task.setDescription(request.description());
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.rewardCoins() != null) task.setRewardCoins(request.rewardCoins());
        if (request.rewardXp() != null) task.setRewardXp(request.rewardXp());
        if (request.deadline() != null) task.setDeadline(request.deadline());
        if (request.assigneeId() != null) task.setAssignee(resolveAssignee(request.assigneeId(), task.getSprint()));

        TaskStatus previousStatus = task.getStatus();
        if (request.status() != null) {
            task.setStatus(request.status());
        }

        task = taskRepository.save(task);
        if (previousStatus != TaskStatus.DONE && task.getStatus() == TaskStatus.DONE) {
            onTaskCompleted(task);
        }
        return entityMapper.toTaskResponse(task);
    }

    @Transactional
    public TaskResponse move(Long taskId, MoveTaskRequest request) {
        Task task = requireTask(taskId);
        projectAccessService.requireAccess(task.getSprint().getProject());

        TaskStatus previousStatus = task.getStatus();
        task.setStatus(request.status());
        task.setPosition(request.position());
        task = taskRepository.save(task);

        if (previousStatus != TaskStatus.DONE && task.getStatus() == TaskStatus.DONE) {
            onTaskCompleted(task);
        }
        return entityMapper.toTaskResponse(task);
    }

    private void onTaskCompleted(Task task) {
        if (task.isRewardClaimed()) {
            return;
        }
        User recipient = resolveRewardRecipient(task);
        gamificationService.rewardUser(recipient, task.getRewardXp(), task.getRewardCoins());
        if (task.getAssignee() == null) {
            task.setAssignee(recipient);
        }
        task.setRewardClaimed(true);
        taskRepository.save(task);
        notificationService.create(
                recipient,
                NotificationType.TASK_COMPLETED,
                "Миссия выполнена",
                "Награда: +" + task.getRewardXp() + " опыта, +" + task.getRewardCoins() + " монет",
                "TASK",
                task.getId()
        );
    }

    private User resolveRewardRecipient(Task task) {
        if (task.getAssignee() != null) {
            return task.getAssignee();
        }
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
    }

    public Task requireTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> ApiException.notFound("Task not found"));
    }

    private User resolveAssignee(Long assigneeId, Sprint sprint) {
        if (assigneeId == null) {
            return null;
        }
        User user = userRepository.findById(assigneeId)
                .orElseThrow(() -> ApiException.notFound("Assignee not found"));
        if (!sprintMemberRepository.existsBySprintIdAndUserId(sprint.getId(), user.getId())) {
            throw ApiException.badRequest("Исполнитель должен состоять в party этого квеста");
        }
        return user;
    }
}
