package com.questparty.controller;

import com.questparty.dto.request.ChatMessageRequest;
import com.questparty.dto.response.ChatMessageResponse;
import com.questparty.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sprints/{sprintId}/chat")
@RequiredArgsConstructor
@Tag(name = "Sprint Chat")
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public List<ChatMessageResponse> history(@PathVariable Long sprintId) {
        return chatService.getHistory(sprintId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessageResponse send(@PathVariable Long sprintId,
                                  @Valid @RequestBody ChatMessageRequest request) {
        return chatService.send(sprintId, request);
    }
}
