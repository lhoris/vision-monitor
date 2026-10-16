package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AlarmIngressRequest;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.exception.ApiException;
import com.vision.sse.AlarmEventPublisher;
import com.vision.sse.AlarmSseBroker;
import com.vision.util.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {
    private final AlarmSseBroker broker;
    private final AlarmEventPublisher publisher;
    private final String modelServerKey;

    public AlarmController(
            AlarmSseBroker broker,
            AlarmEventPublisher publisher,
            @Value("${vision.sse.model-server-key:}") String modelServerKey
    ) {
        this.broker = broker;
        this.publisher = publisher;
        this.modelServerKey = modelServerKey;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        return broker.subscribe(user.username());
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> ingest(
            @RequestHeader(value = "X-Model-Server-Key", required = false) String providedKey,
            @RequestBody AlarmIngressRequest request
    ) {
        requireModelServerKey(providedKey);
        publisher.publishToAll(request.toSsePayload());
        return ResponseEntity.accepted().body(ApiResponse.success(Map.of("accepted", true)));
    }

    private void requireModelServerKey(String providedKey) {
        if (modelServerKey.isBlank() || providedKey == null
                || !MessageDigest.isEqual(
                modelServerKey.getBytes(StandardCharsets.UTF_8),
                providedKey.getBytes(StandardCharsets.UTF_8))) {
            throw new ApiException("FORBIDDEN", "Model server authentication failed");
        }
    }
}
