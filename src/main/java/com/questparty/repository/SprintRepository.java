package com.questparty.repository;

import com.questparty.domain.entity.Sprint;
import com.questparty.domain.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectIdOrderByStartDateDesc(Long projectId);

    long countByProjectIdAndStatus(Long projectId, SprintStatus status);
}
