package com.eduquest.controller;

import com.eduquest.dto.*;
import com.eduquest.model.ParticipantResult;
import com.eduquest.model.User;
import com.eduquest.service.ContestService;
import com.eduquest.service.QuestionGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;
    private final QuestionGenerationService questionGenerationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContestResponse>> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateContestRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.createContest(user.getId(), request)));
    }

    @GetMapping("/host")
    public ResponseEntity<ApiResponse<List<ContestResponse>>> getHostContests(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.getHostContests(user.getId())));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<ContestResponse>> getByRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.getByRoomId(roomId, false)));
    }

    @PostMapping("/room/{roomId}/join")
    public ResponseEntity<ApiResponse<ParticipantResult>> join(
            @AuthenticationPrincipal User user,
            @PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.joinContest(roomId, user.getId())));
    }

    @PostMapping("/room/{roomId}/start")
    public ResponseEntity<ApiResponse<ContestResponse>> start(
            @AuthenticationPrincipal User user,
            @PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.startContest(roomId, user.getId())));
    }

    @PostMapping("/room/{roomId}/end")
    public ResponseEntity<ApiResponse<ContestResponse>> end(
            @AuthenticationPrincipal User user,
            @PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.endContest(roomId, user.getId())));
    }

    @PostMapping("/room/{roomId}/answer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitAnswer(
            @AuthenticationPrincipal User user,
            @PathVariable String roomId,
            @Valid @RequestBody SubmitAnswerRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.submitAnswer(roomId, user.getId(), request)));
    }

    @GetMapping("/room/{roomId}/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> getLeaderboard(@PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.getLeaderboard(roomId)));
    }

    @GetMapping("/room/{roomId}/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @AuthenticationPrincipal User user,
            @PathVariable String roomId) {
        return ResponseEntity.ok(ApiResponse.ok(contestService.getContestAnalytics(roomId, user.getId())));
    }

    @PostMapping("/room/{roomId}/questions")
    public ResponseEntity<ApiResponse<Void>> addQuestions(
            @AuthenticationPrincipal User user,
            @PathVariable String roomId,
            @RequestBody List<QuestionDto> questions) {
        contestService.addQuestions(roomId, user.getId(), questions);
        return ResponseEntity.ok(ApiResponse.ok("Questions added", null));
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<ApiResponse<List<QuestionDto>>> generateQuestions(
            @Valid @RequestBody GenerateQuestionsRequest request) {
        List<QuestionDto> questions = questionGenerationService.generateQuestions(
                request.getTopic(), request.getDifficulty(), request.getCount());
        return ResponseEntity.ok(ApiResponse.ok(questions));
    }
}
