package com.questparty.repository;

import com.questparty.domain.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerId(Long ownerId);

    List<Project> findAllByOrderByUpdatedAtDesc();

    @Query("""
            SELECT DISTINCT p FROM Project p
            LEFT JOIN ProjectMember pm ON pm.project = p
            WHERE p.owner.id = :userId OR pm.user.id = :userId
            ORDER BY p.updatedAt DESC
            """)
    List<Project> findAccessibleByUser(@Param("userId") Long userId);
}
