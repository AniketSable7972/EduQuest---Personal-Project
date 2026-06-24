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
public class UserContestHistory {

    private String contestId;
    private String roomId;
    private String title;
    private int score;
    private Integer rank;
    private double accuracy;
    private int correctCount;
    private int incorrectCount;
    private long completionTimeMs;
    private Instant finishedAt;
}
