package com.eduquest.service;

import com.eduquest.dto.*;
import com.eduquest.exception.BadRequestException;
import com.eduquest.exception.ResourceNotFoundException;
import com.eduquest.exception.UnauthorizedException;
import com.eduquest.model.*;
import com.eduquest.repository.ContestRepository;
import com.eduquest.repository.ParticipantResultRepository;
import com.eduquest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository contestRepository;
    private final ParticipantResultRepository participantResultRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SecureRandom random = new SecureRandom();

    public ContestResponse createContest(String hostId, CreateContestRequest request) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new ResourceNotFoundException("Host not found"));

        validateTimerSettings(request);

        List<Question> questions = mapQuestions(request.getQuestions());

        Contest contest = Contest.builder()
                .roomId(generateRoomId())
                .hostId(hostId)
                .hostName(host.getName())
                .title(request.getTitle())
                .description(request.getDescription())
                .questions(questions)
                .status(ContestStatus.WAITING)
                .timerMode(request.getTimerMode())
                .perQuestionSeconds(request.getPerQuestionSeconds())
                .totalMinutes(request.getTotalMinutes())
                .createdAt(Instant.now())
                .build();

        contest = contestRepository.save(contest);
        return toContestResponse(contest, false);
    }

    public ContestResponse getByRoomId(String roomId, boolean includeAnswers) {
        Contest contest = contestRepository.findByRoomId(roomId.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Contest room not found"));
        return toContestResponse(contest, includeAnswers);
    }

    public List<ContestResponse> getHostContests(String hostId) {
        return contestRepository.findByHostIdOrderByCreatedAtDesc(hostId).stream()
                .map(c -> toContestResponse(c, false))
                .collect(Collectors.toList());
    }

    public ParticipantResult joinContest(String roomId, String userId) {
        Contest contest = getContestEntity(roomId);

        if (contest.getStatus() == ContestStatus.FINISHED) {
            throw new BadRequestException("Contest has already ended");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<ParticipantResult> existing = participantResultRepository
                .findByContestIdAndUserId(contest.getId(), userId);

        if (existing.isPresent()) {
            return existing.get();
        }

        if (!contest.getParticipantIds().contains(userId)) {
            contest.getParticipantIds().add(userId);
            contestRepository.save(contest);
        }

        ParticipantResult result = ParticipantResult.builder()
                .contestId(contest.getId())
                .roomId(contest.getRoomId())
                .userId(userId)
                .userName(user.getName())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .joinedAt(Instant.now())
                .build();

        result = participantResultRepository.save(result);
        broadcastLeaderboard(contest.getRoomId());
        return result;
    }

    public ContestResponse startContest(String roomId, String hostId) {
        Contest contest = getContestEntity(roomId);

        if (!contest.getHostId().equals(hostId)) {
            throw new UnauthorizedException("Only the host can start the contest");
        }

        if (contest.getQuestions().isEmpty()) {
            throw new BadRequestException("Contest must have at least one question");
        }

        contest.setStatus(ContestStatus.LIVE);
        contest.setStartedAt(Instant.now());
        contest = contestRepository.save(contest);

        messagingTemplate.convertAndSend("/topic/contest/" + roomId + "/status",
                Map.of("status", ContestStatus.LIVE.name(), "startedAt", contest.getStartedAt()));

        return toContestResponse(contest, false);
    }

    public ContestResponse endContest(String roomId, String hostId) {
        Contest contest = getContestEntity(roomId);

        if (!contest.getHostId().equals(hostId)) {
            throw new UnauthorizedException("Only the host can end the contest");
        }

        contest.setStatus(ContestStatus.FINISHED);
        contest.setEndedAt(Instant.now());
        contest = contestRepository.save(contest);

        recalculateRanks(contest.getId());
        List<LeaderboardEntry> leaderboard = getLeaderboard(roomId);

        messagingTemplate.convertAndSend("/topic/contest/" + roomId + "/status",
                Map.of("status", ContestStatus.FINISHED.name(), "endedAt", contest.getEndedAt()));
        messagingTemplate.convertAndSend("/topic/contest/" + roomId + "/leaderboard", leaderboard);

        return toContestResponse(contest, false);
    }

    public Map<String, Object> submitAnswer(String roomId, String userId, SubmitAnswerRequest request) {
        Contest contest = getContestEntity(roomId);

        if (contest.getStatus() != ContestStatus.LIVE) {
            throw new BadRequestException("Contest is not live");
        }

        ParticipantResult result = participantResultRepository
                .findByContestIdAndUserId(contest.getId(), userId)
                .orElseThrow(() -> new BadRequestException("Join the contest first"));

        Question question = contest.getQuestions().stream()
                .filter(q -> q.getId().equals(request.getQuestionId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Question not found"));

        boolean alreadyAnswered = result.getAnswers().stream()
                .anyMatch(a -> a.getQuestionId().equals(request.getQuestionId()));

        if (alreadyAnswered) {
            throw new BadRequestException("Question already answered");
        }

        boolean correct = question.getCorrectIndex() == request.getSelectedIndex();
        int points = calculatePoints(correct, question.getDifficulty(), request.getTimeTakenMs());

        AnswerRecord record = AnswerRecord.builder()
                .questionId(question.getId())
                .selectedIndex(request.getSelectedIndex())
                .correct(correct)
                .timeTakenMs(request.getTimeTakenMs())
                .build();

        result.getAnswers().add(record);
        result.setScore(result.getScore() + points);
        result.setCorrectCount(result.getCorrectCount() + (correct ? 1 : 0));
        result.setIncorrectCount(result.getIncorrectCount() + (correct ? 0 : 1));
        result.setCompletionTimeMs(result.getCompletionTimeMs() + request.getTimeTakenMs());
        updateAccuracy(result);

        if (result.getAnswers().size() == contest.getQuestions().size()) {
            result.setFinishedAt(Instant.now());
        }

        participantResultRepository.save(result);
        recalculateRanks(contest.getId());

        List<LeaderboardEntry> leaderboard = getLeaderboard(roomId);
        messagingTemplate.convertAndSend("/topic/contest/" + roomId + "/leaderboard", leaderboard);

        return Map.of(
                "correct", correct,
                "pointsEarned", points,
                "totalScore", result.getScore(),
                "finished", result.getFinishedAt() != null
        );
    }

    public List<LeaderboardEntry> getLeaderboard(String roomId) {
        Contest contest = getContestEntity(roomId);
        return participantResultRepository
                .findByContestIdOrderByScoreDescCompletionTimeMsAsc(contest.getId())
                .stream()
                .map(this::toLeaderboardEntry)
                .collect(Collectors.toList());
    }

    public AnalyticsResponse getContestAnalytics(String roomId, String requesterId) {
        Contest contest = getContestEntity(roomId);

        if (!contest.getHostId().equals(requesterId)) {
            throw new UnauthorizedException("Only the host can view contest analytics");
        }

        List<LeaderboardEntry> leaderboard = getLeaderboard(roomId);
        double avgScore = leaderboard.stream().mapToInt(LeaderboardEntry::getScore).average().orElse(0);
        double avgAccuracy = leaderboard.stream().mapToDouble(LeaderboardEntry::getAccuracy).average().orElse(0);

        return AnalyticsResponse.builder()
                .contestId(contest.getId())
                .roomId(contest.getRoomId())
                .contestTitle(contest.getTitle())
                .totalParticipants(leaderboard.size())
                .averageScore(avgScore)
                .averageAccuracy(avgAccuracy)
                .leaderboard(leaderboard)
                .finishedAt(contest.getEndedAt())
                .build();
    }

    public void addQuestions(String roomId, String hostId, List<QuestionDto> questionDtos) {
        Contest contest = getContestEntity(roomId);

        if (!contest.getHostId().equals(hostId)) {
            throw new UnauthorizedException("Only the host can modify questions");
        }

        if (contest.getStatus() == ContestStatus.LIVE || contest.getStatus() == ContestStatus.FINISHED) {
            throw new BadRequestException("Cannot modify questions after contest started");
        }

        contest.getQuestions().addAll(mapQuestions(questionDtos));
        contestRepository.save(contest);
    }

    private Contest getContestEntity(String roomId) {
        return contestRepository.findByRoomId(roomId.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Contest room not found"));
    }

    private void validateTimerSettings(CreateContestRequest request) {
        if (request.getTimerMode() == TimerMode.PER_QUESTION) {
            if (request.getPerQuestionSeconds() == null || request.getPerQuestionSeconds() < 5) {
                throw new BadRequestException("Per-question timer must be at least 5 seconds");
            }
        } else if (request.getTimerMode() == TimerMode.FULL_CONTEST) {
            if (request.getTotalMinutes() == null || request.getTotalMinutes() < 1) {
                throw new BadRequestException("Total contest duration must be at least 1 minute");
            }
        }
    }

    private List<Question> mapQuestions(List<QuestionDto> dtos) {
        if (dtos == null) {
            return new ArrayList<>();
        }

        return dtos.stream().map(dto -> Question.builder()
                .id(UUID.randomUUID().toString())
                .text(dto.getText())
                .options(dto.getOptions())
                .correctIndex(dto.getCorrectIndex())
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : Difficulty.MEDIUM)
                .topic(dto.getTopic())
                .build()).collect(Collectors.toList());
    }

    private String generateRoomId() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        String roomId = sb.toString();
        if (contestRepository.findByRoomId(roomId).isPresent()) {
            return generateRoomId();
        }
        return roomId;
    }

    private int calculatePoints(boolean correct, Difficulty difficulty, long timeTakenMs) {
        if (!correct) {
            return 0;
        }
        int base = switch (difficulty != null ? difficulty : Difficulty.MEDIUM) {
            case EASY -> 100;
            case MEDIUM -> 150;
            case HARD -> 200;
        };
        int timeBonus = Math.max(0, 50 - (int) (timeTakenMs / 1000));
        return base + timeBonus;
    }

    private void updateAccuracy(ParticipantResult result) {
        int total = result.getCorrectCount() + result.getIncorrectCount();
        result.setAccuracy(total == 0 ? 0 : (result.getCorrectCount() * 100.0) / total);
    }

    private void recalculateRanks(String contestId) {
        List<ParticipantResult> results = participantResultRepository
                .findByContestIdOrderByScoreDescCompletionTimeMsAsc(contestId);

        int rank = 1;
        for (ParticipantResult result : results) {
            result.setRank(rank++);
            participantResultRepository.save(result);
        }
    }

    private void broadcastLeaderboard(String roomId) {
        messagingTemplate.convertAndSend("/topic/contest/" + roomId + "/leaderboard", getLeaderboard(roomId));
    }

    private LeaderboardEntry toLeaderboardEntry(ParticipantResult result) {
        return LeaderboardEntry.builder()
                .userId(result.getUserId())
                .userName(result.getUserName())
                .profilePhotoUrl(result.getProfilePhotoUrl())
                .score(result.getScore())
                .correctCount(result.getCorrectCount())
                .incorrectCount(result.getIncorrectCount())
                .accuracy(result.getAccuracy())
                .completionTimeMs(result.getCompletionTimeMs())
                .rank(result.getRank())
                .finished(result.getFinishedAt() != null)
                .build();
    }

    private ContestResponse toContestResponse(Contest contest, boolean includeAnswers) {
        List<QuestionResponse> questions = contest.getQuestions().stream()
                .map(q -> QuestionResponse.builder()
                        .id(q.getId())
                        .text(q.getText())
                        .options(q.getOptions())
                        .difficulty(q.getDifficulty())
                        .topic(q.getTopic())
                        .build())
                .collect(Collectors.toList());

        return ContestResponse.builder()
                .id(contest.getId())
                .roomId(contest.getRoomId())
                .hostId(contest.getHostId())
                .hostName(contest.getHostName())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .questions(questions)
                .status(contest.getStatus())
                .timerMode(contest.getTimerMode())
                .perQuestionSeconds(contest.getPerQuestionSeconds())
                .totalMinutes(contest.getTotalMinutes())
                .participantCount(contest.getParticipantIds().size())
                .createdAt(contest.getCreatedAt())
                .startedAt(contest.getStartedAt())
                .endedAt(contest.getEndedAt())
                .build();
    }
}
