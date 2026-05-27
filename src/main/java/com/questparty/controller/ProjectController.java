package com.questparty.controller;

import com.questparty.dto.request.CreateProjectRequest;
import com.questparty.dto.response.ProjectResponse;
import com.questparty.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create project")
    public ProjectResponse create(@Valid @RequestBody CreateProjectRequest request) {
        return projectService.create(request);
    }

    @GetMapping
    @Operation(summary = "List accessible projects")
    public List<ProjectResponse> list() {
        return projectService.listMine();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by id")
    public ProjectResponse get(@PathVariable Long id) {
        return projectService.getById(id);
    }

    @PostMapping("/{id}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Add member to project")
    public void addMember(@PathVariable Long id, @PathVariable Long userId) {
        projectService.addMember(id, userId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete project")
    public void delete(@PathVariable Long id) {
        projectService.delete(id);
    }
}
