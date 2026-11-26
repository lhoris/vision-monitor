package com.vision.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Manual Teams Incoming Webhook connectivity test.
 *
 * This test is skipped unless -Dteams.test.enabled=true and
 * -Dteams.webhook-url=https://... are supplied.
 */
class TeamsWebhookDeliveryTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Test
    void sendsTestMessageThroughTeamsWebhook() throws Exception {
        assumeTrue(Boolean.getBoolean("teams.test.enabled"),
                "Teams test skipped. Use -Dteams.test.enabled=true to send a real message.");

        String webhookUrl = System.getProperty("teams.webhook-url", "").trim();
        assumeTrue(!webhookUrl.isBlank(),
                "Teams test skipped. Supply -Dteams.webhook-url=https://... .");

        String text = System.getProperty("teams.test-message",
                "Vision Monitor Teams 알림봇 연결 테스트입니다.");
        String payload = objectMapper.writeValueAsString(Map.of("text", text));
        HttpRequest request = HttpRequest.newBuilder(URI.create(webhookUrl))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        assertTrue(response.statusCode() >= 200 && response.statusCode() < 300,
                () -> "Teams webhook failed: HTTP " + response.statusCode() + " - " + response.body());
    }
}
