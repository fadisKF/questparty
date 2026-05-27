package com.questparty.controller;

import com.questparty.dto.request.LoginRequest;
import com.questparty.dto.request.RegisterRequest;
import com.questparty.dto.request.UpdateProfileRequest;
import com.questparty.dto.response.AuthResponse;
import com.questparty.dto.response.UserResponse;
import com.questparty.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register new user")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public UserResponse profile() {
        return authService.getProfile();
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public UserResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(request);
    }
}
