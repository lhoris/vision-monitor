package com.vision.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

/** Application boundary for future alarm producers. */
@Component
@RequiredArgsConstructor
public class AlarmEventPublisher {
    private final AlarmSseBroker broker;

    public void publishToUser(String username, Map<String, Object> alarm) {
        broker.publishToUser(username, AlarmSseEvent.alarm(alarm));
    }

    public void publishToUser(String username, Object alarm) {
        broker.publishToUser(username, AlarmSseEvent.alarm(alarm));
    }
}
