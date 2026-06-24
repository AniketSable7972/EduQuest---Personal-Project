package com.eduquest.dto;

import com.eduquest.model.ContestStatus;
import com.eduquest.model.TimerMode;
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
public class ContestResponse {

    private String id;
    private String roomId;
    private String hostId;
    private String hostName;
    private String title;
    private String description;
    private List<QuestionResponse> questions;
    private ContestStatus status;
    private TimerMode timerMode;
    private Integer perQuestionSeconds;
    private Integer totalMinutes;
    private int participantCount;
    private Instant createdAt;
    private Instant startedAt;
    private Instant endedAt;
}
