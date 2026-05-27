package com.questparty.service;

import com.questparty.domain.entity.User;
import com.questparty.domain.enums.Role;
import com.questparty.dto.request.LoginRequest;
import com.questparty.dto.request.RegisterRequest;
import com.questparty.dto.request.UpdateProfileRequest;
import com.questparty.dto.response.AuthResponse;
import com.questparty.dto.response.UserResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.UserRepository;
import com.questparty.security.JwtService;
import com.questparty.security.SecurityUtils;
import com.questparty.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EntityMapper entityMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("Пользователь с таким email уже зарегистрирован");
        }
        Role role = Role.EMPLOYEE;

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .role(role)
                .build();
        user = userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return AuthResponse.of(token, entityMapper.toUserResponse(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        String token = jwtService.generateToken(new UserPrincipal(user));
        return AuthResponse.of(token, entityMapper.toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile() {
        User user = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        return entityMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        if (request.bio() != null) {
            user.setBio(request.bio());
        }
        return entityMapper.toUserResponse(userRepository.save(user));
    }
}
