package com.eduquest.dto;

import com.eduquest.model.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private String id;
    private String text;
    private List<String> options;
    private Difficulty difficulty;
    private String topic;
}
