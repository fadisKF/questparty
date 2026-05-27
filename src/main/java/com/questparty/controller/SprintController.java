package com.questparty.controller;

import com.questparty.dto.request.CreateSprintRequest;
import com.questparty.dto.request.UpdateSprintRequest;
import com.questparty.dto.response.SprintResponse;
import com.questparty.service.SprintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Quests (Sprints)")
public class SprintController {

    private final SprintService sprintService;

    @PostMapping("/projects/{projectId}/sprints")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create quest (sprint)")
    public SprintResponse create(@PathVariable Long projectId,
                                 @Valid @RequestBody CreateSprintRequest request) {
        return sprintService.create(projectId, request);
    }

    @GetMapping("/projects/{projectId}/sprints")
    @Operation(summary = "List quests in project")
    public List<SprintResponse> list(@PathVariable Long projectId) {
        return sprintService.listByProject(projectId);
    }

    @GetMapping("/sprints/{id}")
    @Operation(summary = "Get quest by id")
    public SprintResponse get(@PathVariable Long id) {
        return sprintService.getById(id);
    }


    @PutMapping("/sprints/{id}")
    @Operation(summary = "Update quest")
    public SprintResponse update(@PathVariable Long id,
                                 @Valid @RequestBody UpdateSprintRequest request) {
        return sprintService.update(id, request);
    }

    @DeleteMapping("/sprints/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete quest")
    public void delete(@PathVariable Long id) {
        sprintService.delete(id);
    }

    @PostMapping("/sprints/{id}/start")
    @Operation(summary = "Start quest")
    public SprintResponse start(@PathVariable Long id) {
        return sprintService.start(id);
    }

    @PostMapping("/sprints/{id}/complete")
    @Operation(summary = "Complete quest")
    public SprintResponse complete(@PathVariable Long id) {
        return sprintService.complete(id);
    }

    @PostMapping("/sprints/{id}/party/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Add party member")
    public void addPartyMember(@PathVariable Long id, @PathVariable Long userId) {
        sprintService.addPartyMember(id, userId);
    }

    @PostMapping("/sprints/{id}/party/join")
    @Operation(summary = "Join quest party as current user")
    public SprintResponse joinParty(@PathVariable Long id) {
        return sprintService.joinParty(id);
    }
}
