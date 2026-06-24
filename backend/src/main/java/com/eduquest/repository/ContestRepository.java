package com.eduquest.repository;

import com.eduquest.model.Contest;
import com.eduquest.model.ContestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ContestRepository extends MongoRepository<Contest, String> {

    Optional<Contest> findByRoomId(String roomId);

    List<Contest> findByHostIdOrderByCreatedAtDesc(String hostId);

    List<Contest> findByStatus(ContestStatus status);
}
