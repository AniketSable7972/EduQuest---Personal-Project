package com.eduquest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EduQuestApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduQuestApplication.class, args);
    }
}
