package com.vision.sse;

import java.time.Instant;
import java.util.Map;

/** Payload envelope sent through the alarm SSE channel. */
public record AlarmSseEvent(String eventName, Object data) {
    public static AlarmSseEvent alarm(Map<String, Object> data) {
        return new AlarmSseEvent("alarm", data);
    }

    public static AlarmSseEvent alarm(Object data) {
        return new AlarmSseEvent("alarm", data);
    }

    static AlarmSseEvent connected(String connectionId) {
        return new AlarmSseEvent("connected", Map.of("connectionId", connectionId));
    }

    static AlarmSseEvent heartbeat() {
        return new AlarmSseEvent("heartbeat", Map.of("sentAt", Instant.now().toString()));
    }
}
