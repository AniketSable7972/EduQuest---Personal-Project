package com.eduquest.dto;

import com.eduquest.model.Difficulty;
import lombok.Data;

import java.util.List;

@Data
public class QuestionDto {

    private String text;
    private List<String> options;
    private int correctIndex;
    private Difficulty difficulty;
    private String topic;
}
