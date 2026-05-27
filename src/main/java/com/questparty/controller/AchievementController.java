package com.questparty.controller;

import com.questparty.dto.response.AchievementResponse;
import com.questparty.service.AchievementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/achievements")
@RequiredArgsConstructor
@Tag(name = "Achievements")
public class AchievementController {

    private final AchievementService achievementService;

    @GetMapping("/me")
    public List<AchievementResponse> myAchievements() {
        return achievementService.getMyAchievements();
    }
}
