package com.eduquest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitAnswerRequest {

    @NotBlank
    private String questionId;

    @NotNull
    @Min(0)
    private Integer selectedIndex;

    @Min(0)
    private long timeTakenMs;
}
