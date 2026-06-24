package com.eduquest.service;

import com.eduquest.dto.UserContestHistory;
import com.eduquest.model.Contest;
import com.eduquest.model.ParticipantResult;
import com.eduquest.repository.ContestRepository;
import com.eduquest.repository.ParticipantResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ParticipantResultRepository participantResultRepository;
    private final ContestRepository contestRepository;

    public List<UserContestHistory> getUserHistory(String userId) {
        return participantResultRepository.findByUserIdOrderByFinishedAtDesc(userId).stream()
                .map(this::toHistory)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getUserStats(String userId) {
        List<ParticipantResult> results = participantResultRepository.findByUserIdOrderByFinishedAtDesc(userId);

        int contestsPlayed = results.size();
        int totalScore = results.stream().mapToInt(ParticipantResult::getScore).sum();
        double avgAccuracy = results.stream().mapToDouble(ParticipantResult::getAccuracy).average().orElse(0);
        long avgCompletion = contestsPlayed == 0 ? 0 :
                (long) results.stream().mapToLong(ParticipantResult::getCompletionTimeMs).average().orElse(0);

        return Map.of(
                "contestsPlayed", contestsPlayed,
                "totalScore", totalScore,
                "averageAccuracy", avgAccuracy,
                "averageCompletionTimeMs", avgCompletion
        );
    }

    private UserContestHistory toHistory(ParticipantResult result) {
        String title = contestRepository.findById(result.getContestId())
                .map(Contest::getTitle)
                .orElse("Unknown Contest");

        return UserContestHistory.builder()
                .contestId(result.getContestId())
                .roomId(result.getRoomId())
                .title(title)
                .score(result.getScore())
                .rank(result.getRank())
                .accuracy(result.getAccuracy())
                .correctCount(result.getCorrectCount())
                .incorrectCount(result.getIncorrectCount())
                .completionTimeMs(result.getCompletionTimeMs())
                .finishedAt(result.getFinishedAt())
                .build();
    }
}
