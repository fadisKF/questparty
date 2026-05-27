package com.questparty.service;

import com.questparty.domain.entity.Project;
import com.questparty.domain.entity.ProjectMember;
import com.questparty.domain.entity.User;
import com.questparty.dto.request.CreateProjectRequest;
import com.questparty.dto.response.ProjectResponse;
import com.questparty.exception.ApiException;
import com.questparty.mapper.EntityMapper;
import com.questparty.repository.ProjectMemberRepository;
import com.questparty.repository.ProjectRepository;
import com.questparty.repository.UserRepository;
import com.questparty.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectAccessService projectAccessService;
    private final EntityMapper entityMapper;

    @Transactional
    public ProjectResponse create(CreateProjectRequest request) {
        User owner = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .owner(owner)
                .build();
        project = projectRepository.save(project);
        if (!projectMemberRepository.existsByProjectIdAndUserId(project.getId(), owner.getId())) {
            projectMemberRepository.save(ProjectMember.builder().project(project).user(owner).build());
        }
        return entityMapper.toProjectResponse(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listMine() {
        if (SecurityUtils.getCurrentUser().getRole() == com.questparty.domain.enums.Role.ADMIN) {
            return projectRepository.findAllByOrderByUpdatedAtDesc().stream()
                    .map(entityMapper::toProjectResponse)
                    .toList();
        }
        return projectRepository.findAccessibleByUser(SecurityUtils.getCurrentUserId()).stream()
                .map(entityMapper::toProjectResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long id) {
        Project project = projectAccessService.requireProject(id);
        projectAccessService.requireAccess(project);
        return entityMapper.toProjectResponse(project);
    }

    @Transactional
    public void addMember(Long projectId, Long userId) {
        Project project = projectAccessService.requireProject(projectId);
        projectAccessService.requireManagerOrOwner(project);
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw ApiException.conflict("Пользователь уже добавлен в проект");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        projectMemberRepository.save(ProjectMember.builder().project(project).user(user).build());
    }

    @Transactional
    public void delete(Long projectId) {
        Project project = projectAccessService.requireProject(projectId);
        projectAccessService.requireAdmin();
        projectRepository.delete(project);
    }
}
