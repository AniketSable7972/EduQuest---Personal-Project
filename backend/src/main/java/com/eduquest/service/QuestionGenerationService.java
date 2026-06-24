package com.eduquest.service;

import com.eduquest.dto.QuestionDto;
import com.eduquest.model.Difficulty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class QuestionGenerationService {

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    @Value("${openai.api.url}")
    private String openAiApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public List<QuestionDto> generateQuestions(String topic, Difficulty difficulty, int count) {
        if (openAiApiKey != null && !openAiApiKey.isBlank()) {
            try {
                return generateWithOpenAi(topic, difficulty, count);
            } catch (Exception ignored) {
                // fall through to template generation
            }
        }
        return generateTemplateQuestions(topic, difficulty, count);
    }

    private List<QuestionDto> generateWithOpenAi(String topic, Difficulty difficulty, int count) throws Exception {
        String prompt = String.format(
                "Generate %d multiple choice quiz questions about '%s' at %s difficulty. " +
                        "Return ONLY valid JSON array with objects: " +
                        "{\"text\":\"question\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctIndex\":0,\"topic\":\"%s\",\"difficulty\":\"%s\"}",
                count, topic, difficulty.name(), topic, difficulty.name());

        Map<String, Object> body = Map.of(
                "model", "gpt-4o-mini",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.7
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                openAiApiUrl,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                JsonNode.class
        );

        String content = Objects.requireNonNull(response.getBody())
                .path("choices").get(0)
                .path("message").path("content").asText();

        content = content.replace("```json", "").replace("```", "").trim();

        return objectMapper.readValue(content, new TypeReference<List<QuestionDto>>() {});
    }

    private List<QuestionDto> generateTemplateQuestions(String topic, Difficulty difficulty, int count) {
        List<QuestionDto> questions = new ArrayList<>();
        String[] templates = {
                "What is a fundamental concept in %s?",
                "Which statement best describes %s?",
                "What is commonly used when studying %s?",
                "Which of the following relates to %s?",
                "What is an important principle in %s?"
        };

        for (int i = 0; i < count; i++) {
            QuestionDto q = new QuestionDto();
            q.setText(String.format(templates[i % templates.length], topic));
            q.setOptions(List.of(
                    "Core theory and definitions",
                    "Unrelated historical events",
                    "Random programming syntax",
                    "None of the above"
            ));
            q.setCorrectIndex(0);
            q.setTopic(topic);
            q.setDifficulty(difficulty);
            questions.add(q);
        }
        return questions;
    }
}
