package com.eduquest.dto;

import com.eduquest.model.Difficulty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GenerateQuestionsRequest {

    @NotBlank
    private String topic;

    @NotNull
    private Difficulty difficulty;

    @Min(1)
    @Max(20)
    private int count;
}
