package com.eduquest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    private String id;
    private String text;
    private List<String> options;
    private int correctIndex;
    private Difficulty difficulty;
    private String topic;
}
