package com.eduquest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contests")
public class Contest {

    @Id
    private String id;

    @Indexed(unique = true)
    private String roomId;

    private String hostId;
    private String hostName;
    private String title;
    private String description;

    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @Builder.Default
    private ContestStatus status = ContestStatus.DRAFT;

    private TimerMode timerMode;
    private Integer perQuestionSeconds;
    private Integer totalMinutes;

    @Builder.Default
    private List<String> participantIds = new ArrayList<>();

    private Instant createdAt;
    private Instant startedAt;
    private Instant endedAt;
}
