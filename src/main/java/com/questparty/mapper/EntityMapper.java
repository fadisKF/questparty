package com.questparty.mapper;

import com.questparty.domain.entity.*;
import com.questparty.dto.response.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getLevel(),
                user.getExperiencePoints(),
                user.getCoins(),
                user.getAvatarUrl(),
                user.getBio(),
                user.isGoldenAvatarFrameActive()
        );
    }

    public UserSummaryResponse toUserSummary(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummaryResponse(
                user.getId(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getLevel(),
                user.isGoldenAvatarFrameActive()
        );
    }

    public ProjectResponse toProjectResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getOwner().getDisplayName(),
                project.isActive(),
                project.getCreatedAt()
        );
    }

    public SprintResponse toSprintResponse(Sprint sprint, java.util.List<UserSummaryResponse> members) {
        return new SprintResponse(
                sprint.getId(),
                sprint.getProject().getId(),
                sprint.getTitle(),
                sprint.getDescription(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getStatus(),
                sprint.getRewardCoins(),
                sprint.getRewardXp(),
                sprint.isRewardClaimed(),
                members,
                sprint.getCreatedAt()
        );
    }

    public TaskResponse toTaskResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getSprint().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getRewardCoins(),
                task.getRewardXp(),
                task.isRewardClaimed(),
                task.getPosition(),
                toUserSummary(task.getAssignee()),
                task.getDeadline(),
                task.getCreatedAt()
        );
    }

    public CommentResponse toCommentResponse(TaskComment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getTask().getId(),
                toUserSummary(comment.getAuthor()),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }

    public ChatMessageResponse toChatMessageResponse(SprintMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getSprint().getId(),
                toUserSummary(message.getAuthor()),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    public ShopItemResponse toShopItemResponse(ShopItem item) {
        return new ShopItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.getStock(),
                item.getImageUrl(),
                item.getCategory(),
                item.isActive()
        );
    }


    public PurchaseResponse toPurchaseResponse(Purchase purchase) {
        return new PurchaseResponse(
                purchase.getId(),
                purchase.getUser().getId(),
                purchase.getUser().getDisplayName(),
                toShopItemResponse(purchase.getShopItem()),
                purchase.getQuantity(),
                purchase.getTotalPrice(),
                purchase.getFulfillmentMethod(),
                purchase.getStatus(),
                purchase.getFulfillmentComment(),
                purchase.getActivatedAt(),
                purchase.getCreatedAt()
        );
    }

    public NotificationResponse toNotificationResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getRelatedEntityType(),
                n.getRelatedEntityId(),
                n.getCreatedAt()
        );
    }

    public AchievementResponse toAchievementResponse(Achievement a, boolean unlocked, java.time.Instant unlockedAt) {
        return new AchievementResponse(
                a.getId(),
                a.getCode(),
                a.getTitle(),
                a.getDescription(),
                a.getIconUrl(),
                a.getXpBonus(),
                a.getCoinsBonus(),
                unlocked,
                unlockedAt
        );
    }
}
