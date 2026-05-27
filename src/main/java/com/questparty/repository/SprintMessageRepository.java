package com.questparty.repository;

import com.questparty.domain.entity.SprintMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintMessageRepository extends JpaRepository<SprintMessage, Long> {

    List<SprintMessage> findBySprintIdOrderByCreatedAtAsc(Long sprintId);
}
