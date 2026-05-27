package com.questparty.repository;

import com.questparty.domain.entity.SprintMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SprintMemberRepository extends JpaRepository<SprintMember, Long> {

    List<SprintMember> findBySprintId(Long sprintId);

    List<SprintMember> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<SprintMember> findBySprintIdAndUserId(Long sprintId, Long userId);

    boolean existsBySprintIdAndUserId(Long sprintId, Long userId);
}
