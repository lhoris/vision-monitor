package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AlarmIngressRequest;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.AlarmLogDto;
import com.vision.exception.ApiException;
import com.vision.entity.AlarmLog;
import com.vision.repository.AlarmLogRepository;
import com.vision.sse.AlarmEventPublisher;
import com.vision.sse.AlarmSseBroker;
import com.vision.util.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {
    private final AlarmSseBroker broker;
    private final AlarmEventPublisher publisher;
    private final AlarmLogRepository alarmLogRepository;
    private final String modelServerKey;

    public AlarmController(
            AlarmSseBroker broker,
            AlarmEventPublisher publisher,
            AlarmLogRepository alarmLogRepository,
            @Value("${vision.sse.model-server-key:}") String modelServerKey
    ) {
        this.broker = broker;
        this.publisher = publisher;
        this.alarmLogRepository = alarmLogRepository;
        this.modelServerKey = modelServerKey;
    }

    public AlarmController(AlarmSseBroker broker, AlarmEventPublisher publisher, String modelServerKey) {
        this(broker, publisher, null, modelServerKey);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        return broker.subscribe(user.username());
    }

    @GetMapping("/unacknowledged")
    public ResponseEntity<ApiResponse<List<AlarmLogDto>>> unacknowledged(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        List<AlarmLogDto> alarms = alarmLogRepository.findByTargetUserIdAndAcknowledgedStatusAndDataEndStatusOrderByOccurredTimestampDesc(
                user.id(), "N", "N").stream().map(AlarmLogDto::from).toList();
        return ResponseEntity.ok(ApiResponse.success(alarms));
    }

    @PutMapping("/{alarmId}/acknowledge")
    public ResponseEntity<ApiResponse<AlarmLogDto>> acknowledge(
            @PathVariable Long alarmId,
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        AlarmLog alarm = alarmLogRepository.findByIdAndTargetUserIdAndDataEndStatus(alarmId, user.id(), "N")
                .orElseThrow(() -> new ApiException("ALARM_NOT_FOUND", "알람을 찾을 수 없습니다."));
        alarm.setAcknowledgedStatus("Y");
        alarm.setAcknowledgedTimestamp(LocalDateTime.now());
        alarm.setAcknowledgedBy(user.id());
        return ResponseEntity.ok(ApiResponse.success(AlarmLogDto.from(alarmLogRepository.save(alarm))));
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
