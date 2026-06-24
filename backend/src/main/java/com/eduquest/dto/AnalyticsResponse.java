package com.eduquest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private String contestId;
    private String roomId;
    private String contestTitle;
    private int totalParticipants;
    private double averageScore;
    private double averageAccuracy;
    private List<LeaderboardEntry> leaderboard;
    private Instant finishedAt;
}
