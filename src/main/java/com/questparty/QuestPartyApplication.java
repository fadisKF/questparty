package com.questparty;

import com.questparty.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Entry point for QuestParty — gamified project management platform.
 */
@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class QuestPartyApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuestPartyApplication.class, args);
    }
}
