package com.questparty.service;

import com.questparty.domain.entity.Notification;
import com.questparty.domain.entity.User;
import com.questparty.domain.enums.NotificationType;
import com.questparty.dto.response.NotificationResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.NotificationRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EntityMapper entityMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void create(User user, NotificationType type, String title, String message,
                       String relatedEntityType, Long relatedEntityId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .build();
        notification = notificationRepository.save(notification);
        NotificationResponse response = entityMapper.toNotificationResponse(notification);
        messagingTemplate.convertAndSend("/topic/users/" + user.getId() + "/notifications", response);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        Long userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(entityMapper::toNotificationResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Not your notification");
        }
        notification.setRead(true);
        return entityMapper.toNotificationResponse(notificationRepository.save(notification));
    }
}
