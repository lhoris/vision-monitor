package com.vision.dto;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/** Common alarm contract accepted from model and other backend producers. */
public record AlarmIngressRequest(
        Long id,
        String source,
        String type,
        String severity,
        Long modelProcessId,
        String description,
        Instant occurredAt,
        Map<String, Object> metadata
) {
    public Map<String, Object> toSsePayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", id == null ? System.currentTimeMillis() : id);
        payload.put("modelProcessId", modelProcessId);
        payload.put("type", type);
        payload.put("severity", severity);
        payload.put("description", description);
        payload.put("timestamp", occurredAt == null ? Instant.now().toString() : occurredAt.toString());
        payload.put("acknowledged", false);
        payload.put("metadata", metadata == null ? Map.of() : metadata);
        payload.put("source", source);
        return payload;
    }
}
