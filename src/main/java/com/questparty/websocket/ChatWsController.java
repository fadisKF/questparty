package com.questparty.websocket;

import com.questparty.dto.request.ChatMessageRequest;
import com.questparty.dto.response.ChatMessageResponse;
import com.questparty.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

/**
 * STOMP endpoint: SEND /app/sprints/{sprintId}/chat
 */
@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final ChatService chatService;

    @MessageMapping("/sprints/{sprintId}/chat")
    public ChatMessageResponse send(@DestinationVariable Long sprintId, ChatMessageRequest request) {
        return chatService.send(sprintId, request);
    }
}
