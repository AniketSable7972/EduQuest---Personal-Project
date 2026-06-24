package com.eduquest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntry {

    private String userId;
    private String userName;
    private String profilePhotoUrl;
    private int score;
    private int correctCount;
    private int incorrectCount;
    private double accuracy;
    private long completionTimeMs;
    private Integer rank;
    private boolean finished;
}
