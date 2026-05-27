package com.questparty.service;

import com.questparty.domain.entity.Project;
import com.questparty.domain.enums.Role;
import com.questparty.exception.ApiException;
import com.questparty.repository.ProjectMemberRepository;
import com.questparty.repository.ProjectRepository;
import com.questparty.security.SecurityUtils;
import com.questparty.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectAccessService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public Project requireProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> ApiException.notFound("Проект не найден"));
    }

    public void requireAccess(Project project) {
        UserPrincipal current = SecurityUtils.getCurrentUser();
        if (current.getRole() == Role.ADMIN) {
            return;
        }
        if (project.getOwner().getId().equals(current.getId())) {
            return;
        }
        if (projectMemberRepository.existsByProjectIdAndUserId(project.getId(), current.getId())) {
            return;
        }
        throw ApiException.forbidden("Нет доступа к этому проекту");
    }

    public void requireManagerOrOwner(Project project) {
        UserPrincipal current = SecurityUtils.getCurrentUser();
        if (current.getRole() == Role.ADMIN || current.getRole() == Role.PROJECT_MANAGER) {
            return;
        }
        throw ApiException.forbidden("Нужна роль администратора или Quest Master");
    }

    public void requireAdmin() {
        UserPrincipal current = SecurityUtils.getCurrentUser();
        if (current.getRole() == Role.ADMIN) {
            return;
        }
        throw ApiException.forbidden("Нужна роль администратора");
    }
}
