package com.questparty.repository;

import com.questparty.domain.entity.Task;
import com.questparty.domain.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findBySprintIdOrderByStatusAscPositionAsc(Long sprintId);

    long countBySprintIdAndStatus(Long sprintId, TaskStatus status);

    long countByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t WHERE t.sprint.id = :sprintId AND t.status = :status")
    int findMaxPositionInColumn(@Param("sprintId") Long sprintId, @Param("status") TaskStatus status);
}
