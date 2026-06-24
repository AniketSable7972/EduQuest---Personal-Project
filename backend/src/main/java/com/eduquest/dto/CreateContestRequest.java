package com.eduquest.dto;

import com.eduquest.model.Difficulty;
import com.eduquest.model.TimerMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateContestRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private TimerMode timerMode;

    private Integer perQuestionSeconds;
    private Integer totalMinutes;

    private List<QuestionDto> questions;
}
