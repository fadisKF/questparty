package com.questparty.service;

import com.questparty.domain.entity.Task;
import com.questparty.domain.entity.TaskComment;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.NotificationType;
import com.questparty.dto.request.CommentRequest;
import com.questparty.dto.response.CommentResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.TaskCommentRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final TaskCommentRepository taskCommentRepository;
    private final TaskService taskService;
    private final ProjectAccessService projectAccessService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public List<CommentResponse> listByTask(Long taskId) {
        Task task = taskService.requireTask(taskId);
        projectAccessService.requireAccess(task.getSprint().getProject());
        return taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(entityMapper::toCommentResponse)
                .toList();
    }

    @Transactional
    public CommentResponse add(Long taskId, CommentRequest request) {
        Task task = taskService.requireTask(taskId);
        projectAccessService.requireAccess(task.getSprint().getProject());
        User author = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));

        TaskComment comment = TaskComment.builder()
                .task(task)
                .author(author)
                .content(request.content())
                .build();
        comment = taskCommentRepository.save(comment);

        if (task.getAssignee() != null && !task.getAssignee().getId().equals(author.getId())) {
            notificationService.create(
                    task.getAssignee(),
                    NotificationType.COMMENT_ADDED,
                    "New comment",
                    author.getDisplayName() + " commented on " + task.getTitle(),
                    "TASK",
                    task.getId()
            );
        }
        return entityMapper.toCommentResponse(comment);
    }
}
