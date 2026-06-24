package com.eduquest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerRecord {

    private String questionId;
    private int selectedIndex;
    private boolean correct;
    private long timeTakenMs;
}
