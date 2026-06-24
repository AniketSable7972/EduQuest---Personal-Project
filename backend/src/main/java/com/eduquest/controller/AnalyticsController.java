package com.eduquest.controller;

import com.eduquest.dto.ApiResponse;
import com.eduquest.dto.UserContestHistory;
import com.eduquest.model.User;
import com.eduquest.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<UserContestHistory>>> getHistory(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getUserHistory(user.getId())));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getUserStats(user.getId())));
    }
}
