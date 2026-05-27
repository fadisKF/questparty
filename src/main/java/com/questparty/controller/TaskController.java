package com.questparty.controller;

import com.questparty.dto.request.CreateTaskRequest;
import com.questparty.dto.request.MoveTaskRequest;
import com.questparty.dto.request.UpdateTaskRequest;
import com.questparty.dto.response.KanbanBoardResponse;
import com.questparty.dto.response.TaskResponse;
import com.questparty.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Tasks (Kanban)")
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/sprints/{sprintId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create task")
    public TaskResponse create(@PathVariable Long sprintId,
                               @Valid @RequestBody CreateTaskRequest request) {
        return taskService.create(sprintId, request);
    }

    @GetMapping("/sprints/{sprintId}/kanban")
    @Operation(summary = "Get Kanban board")
    public KanbanBoardResponse kanban(@PathVariable Long sprintId) {
        return taskService.getKanbanBoard(sprintId);
    }

    @PutMapping("/tasks/{id}")
    @Operation(summary = "Update task")
    public TaskResponse update(@PathVariable Long id,
                               @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.update(id, request);
    }

    @PatchMapping("/tasks/{id}/move")
    @Operation(summary = "Move task (drag-and-drop)")
    public TaskResponse move(@PathVariable Long id,
                             @Valid @RequestBody MoveTaskRequest request) {
        return taskService.move(id, request);
    }
}
