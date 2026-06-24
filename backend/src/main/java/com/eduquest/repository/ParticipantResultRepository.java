package com.eduquest.repository;

import com.eduquest.model.ParticipantResult;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantResultRepository extends MongoRepository<ParticipantResult, String> {

    List<ParticipantResult> findByContestIdOrderByScoreDescCompletionTimeMsAsc(String contestId);

    Optional<ParticipantResult> findByContestIdAndUserId(String contestId, String userId);

    List<ParticipantResult> findByUserIdOrderByFinishedAtDesc(String userId);

    long countByContestId(String contestId);
}
