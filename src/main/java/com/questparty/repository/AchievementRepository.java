package com.questparty.repository;

import com.questparty.domain.entity.Achievement;
import com.questparty.domain.enums.AchievementCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    Optional<Achievement> findByCode(AchievementCode code);
}
