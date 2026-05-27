package com.questparty.repository;

import com.questparty.domain.entity.User;
import com.questparty.domain.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.experiencePoints DESC")
    List<User> findLeaderboard();

    long countByRole(Role role);
}
