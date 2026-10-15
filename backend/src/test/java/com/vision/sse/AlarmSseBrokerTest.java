package com.vision.sse;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AlarmSseBrokerTest {
    private final AlarmSseBroker broker = new AlarmSseBroker(60_000L);

    @AfterEach
    void tearDown() {
        broker.shutdown();
    }

    @Test
    void keepsSubscriptionsIsolatedByUser() {
        SseEmitter first = broker.subscribe("alice");
        SseEmitter second = broker.subscribe("bob");

        broker.publishToUser("alice", AlarmSseEvent.alarm(Map.of("id", 1)));

        assertEquals(1, broker.subscriberCount("alice"));
        assertEquals(1, broker.subscriberCount("bob"));
        first.complete();
        second.complete();
    }

    @Test
    void removesCompletedSubscriptions() {
        SseEmitter emitter = broker.subscribe("alice");
        assertEquals(1, broker.subscriberCount("alice"));

        emitter.complete();
        broker.publishToUser("alice", AlarmSseEvent.alarm(Map.of("id", 2)));

        assertEquals(0, broker.subscriberCount("alice"));
    }
}
