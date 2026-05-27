package com.questparty.service;

import com.questparty.domain.entity.Sprint;
import com.questparty.domain.entity.SprintMessage;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.NotificationType;
import com.questparty.dto.request.ChatMessageRequest;
import com.questparty.dto.response.ChatMessageResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.SprintMemberRepository;
import com.questparty.repository.SprintMessageRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final SprintMessageRepository sprintMessageRepository;
    private final SprintMemberRepository sprintMemberRepository;
    private final SprintService sprintService;
    private final ProjectAccessService projectAccessService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getHistory(Long sprintId) {
        Sprint sprint = sprintService.requireSprint(sprintId);
        projectAccessService.requireAccess(sprint.getProject());
        return sprintMessageRepository.findBySprintIdOrderByCreatedAtAsc(sprintId).stream()
                .map(entityMapper::toChatMessageResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse send(Long sprintId, ChatMessageRequest request) {
        Sprint sprint = sprintService.requireSprint(sprintId);
        projectAccessService.requireAccess(sprint.getProject());
        User author = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));

        SprintMessage message = SprintMessage.builder()
                .sprint(sprint)
                .author(author)
                .content(request.content())
                .build();
        message = sprintMessageRepository.save(message);
        ChatMessageResponse response = entityMapper.toChatMessageResponse(message);

        messagingTemplate.convertAndSend("/topic/sprints/" + sprintId + "/chat", response);
        sprintMemberRepository.findBySprintId(sprintId).stream()
                .filter(member -> !member.getUser().getId().equals(author.getId()))
                .forEach(member -> notificationService.create(
                        member.getUser(),
                        NotificationType.CHAT_MESSAGE,
                        "New party chat message",
                        author.getDisplayName() + ": " + request.content(),
                        "SPRINT",
                        sprintId
                ));
        return response;
    }
}
