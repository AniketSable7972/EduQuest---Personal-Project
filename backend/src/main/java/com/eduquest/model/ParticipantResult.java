package com.eduquest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "participant_results")
@CompoundIndex(name = "contest_user_idx", def = "{'contestId': 1, 'userId': 1}", unique = true)
public class ParticipantResult {

    @Id
    private String id;

    private String contestId;
    private String roomId;
    private String userId;
    private String userName;
    private String profilePhotoUrl;

    @Builder.Default
    private int score = 0;

    private Integer rank;

    @Builder.Default
    private int correctCount = 0;

    @Builder.Default
    private int incorrectCount = 0;

    private double accuracy;

    private long completionTimeMs;

    @Builder.Default
    private List<AnswerRecord> answers = new ArrayList<>();

    private Instant joinedAt;
    private Instant finishedAt;
}
