package com.questparty.controller;

import com.questparty.dto.response.UserProfileResponse;
import com.questparty.dto.response.UserSummaryResponse;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.UserRepository;
import com.questparty.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users")
public class UserController {

    private final UserRepository userRepository;
    private final EntityMapper entityMapper;
    private final UserProfileService userProfileService;

    @GetMapping
    @Operation(summary = "List users for project and party assignment")
    public List<UserSummaryResponse> list() {
        return userRepository.findAll().stream()
                .map(entityMapper::toUserSummary)
                .toList();
    }

    @GetMapping("/{id}/profile")
    @Operation(summary = "Public user profile; self and admins also see inventory and quests")
    public UserProfileResponse profile(@PathVariable Long id) {
        return userProfileService.getProfile(id);
    }
}
