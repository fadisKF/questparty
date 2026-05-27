package com.questparty.controller;

import com.questparty.dto.request.CommentRequest;
import com.questparty.dto.response.CommentResponse;
import com.questparty.service.CommentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks/{taskId}/comments")
@RequiredArgsConstructor
@Tag(name = "Task Comments")
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public List<CommentResponse> list(@PathVariable Long taskId) {
        return commentService.listByTask(taskId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse add(@PathVariable Long taskId, @Valid @RequestBody CommentRequest request) {
        return commentService.add(taskId, request);
    }
}
