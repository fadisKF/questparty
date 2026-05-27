package com.questparty.controller;

import com.questparty.dto.request.UpdateUserRoleRequest;
import com.questparty.dto.request.AdminAdjustUserStatsRequest;
import com.questparty.dto.response.UserResponse;
import com.questparty.service.UserAdministrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin: User roles")
public class AdminUserController {

    private final UserAdministrationService userAdministrationService;

    @GetMapping
    @Operation(summary = "List users with roles")
    public List<UserResponse> listUsers() {
        return userAdministrationService.listUsers();
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Change user role")
    public UserResponse updateRole(@PathVariable Long id,
                                   @Valid @RequestBody UpdateUserRoleRequest request) {
        return userAdministrationService.updateRole(id, request);
    }

    @PatchMapping("/{id}/stats")
    @Operation(summary = "Add coins and experience to a user")
    public UserResponse addStats(@PathVariable Long id,
                                 @Valid @RequestBody AdminAdjustUserStatsRequest request) {
        return userAdministrationService.addStats(id, request);
    }
}
