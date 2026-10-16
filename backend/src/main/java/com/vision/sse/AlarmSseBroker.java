package com.vision.sse;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/** Single-node, user-scoped SSE broker for the MVP alarm channel. */
@Component
public class AlarmSseBroker {
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatExecutor = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "alarm-sse-heartbeat");
        thread.setDaemon(true);
        return thread;
    });
    private final long heartbeatPeriodMillis;

    public AlarmSseBroker(@Value("${vision.sse.heartbeat-ms:15000}") long heartbeatPeriodMillis) {
        this.heartbeatPeriodMillis = Math.max(1000L, heartbeatPeriodMillis);
        heartbeatExecutor.scheduleAtFixedRate(this::sendHeartbeats, this.heartbeatPeriodMillis,
                this.heartbeatPeriodMillis, TimeUnit.MILLISECONDS);
    }

    public SseEmitter subscribe(String username) {
        SseEmitter emitter = new SseEmitter(0L);
        emittersByUser.computeIfAbsent(username, ignored -> new CopyOnWriteArrayList<>()).add(emitter);
        registerCleanup(username, emitter);
        send(username, emitter, AlarmSseEvent.connected(UUID.randomUUID().toString()));
        return emitter;
    }

    public void publishToUser(String username, AlarmSseEvent event) {
        List<SseEmitter> emitters = emittersByUser.get(username);
        if (emitters == null) return;
        emitters.forEach(emitter -> send(username, emitter, event));
    }

    public void publishToAll(AlarmSseEvent event) {
        emittersByUser.forEach((username, emitters) ->
                emitters.forEach(emitter -> send(username, emitter, event)));
    }

    public int subscriberCount(String username) {
        return emittersByUser.getOrDefault(username, new CopyOnWriteArrayList<>()).size();
    }

    private void sendHeartbeats() {
        emittersByUser.forEach((username, emitters) -> emitters.forEach(emitter -> send(username, emitter, AlarmSseEvent.heartbeat())));
    }

    private void send(String username, SseEmitter emitter, AlarmSseEvent event) {
        try {
            emitter.send(SseEmitter.event()
                    .name(event.eventName())
                    .data(event.data(), MediaType.APPLICATION_JSON));
        } catch (IOException | IllegalStateException exception) {
            remove(username, emitter);
            emitter.completeWithError(exception);
        }
    }

    private void registerCleanup(String username, SseEmitter emitter) {
        emitter.onCompletion(() -> remove(username, emitter));
        emitter.onTimeout(() -> remove(username, emitter));
        emitter.onError(ignored -> remove(username, emitter));
    }

    private void remove(String username, SseEmitter emitter) {
        emittersByUser.computeIfPresent(username, (ignored, emitters) -> {
            emitters.remove(emitter);
            return emitters.isEmpty() ? null : emitters;
        });
    }

    @PreDestroy
    public void shutdown() {
        heartbeatExecutor.shutdownNow();
        emittersByUser.values().forEach(emitters -> emitters.forEach(SseEmitter::complete));
        emittersByUser.clear();
    }
}
