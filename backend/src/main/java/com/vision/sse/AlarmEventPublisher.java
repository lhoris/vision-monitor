package com.vision.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Collection;

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

    public void publishToAll(Map<String, Object> alarm) {
        broker.publishToAll(AlarmSseEvent.alarm(alarm));
    }

    public void publishToUsers(Collection<String> usernames, Map<String, Object> alarm) {
        usernames.forEach(username -> publishToUser(username, alarm));
    }
}
