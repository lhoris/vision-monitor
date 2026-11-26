package com.vision.service;

import com.vision.dto.AlarmIngressRequest;
import com.vision.entity.AlarmRequest;
import com.vision.entity.AlarmRule;
import com.vision.exception.ApiException;
import com.vision.repository.AlarmRequestRepository;
import com.vision.repository.AlarmRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class AlarmIngressService {
    private static final String ACTIVE = "N";
    private final AlarmRequestRepository alarmRequestRepository;
    private final AlarmRuleRepository alarmRuleRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AlarmRequest register(AlarmIngressRequest request) {
        if (request == null || request.type() == null || request.type().isBlank()) {
            throw new ApiException("ALARM_TYPE_REQUIRED", "알람 코드가 필요합니다.");
        }
        String alarmCode = request.type().trim();
        AlarmRule rule = alarmRuleRepository.findByCodeIgnoreCaseAndDataEndStatus(alarmCode, ACTIVE)
                .orElseThrow(() -> new ApiException("ALARM_RULE_NOT_FOUND", "활성 알람 기준을 찾을 수 없습니다: " + alarmCode));
        String sourceEventId = sourceEventId(request);
        var existing = alarmRequestRepository.findBySourceEventId(sourceEventId);
        if (existing.isPresent()) return existing.get();

        LocalDateTime occurredAt = request.occurredAt() == null
                ? LocalDateTime.now(ZoneOffset.UTC)
                : LocalDateTime.ofInstant(request.occurredAt(), ZoneOffset.UTC);
        AlarmRequest alarmRequest = new AlarmRequest();
        alarmRequest.setAlarmRuleId(rule.getId());
        alarmRequest.setAlarmCode(rule.getCode());
        alarmRequest.setSeverity(request.severity() == null ? "info" : request.severity());
        alarmRequest.setMessage(request.description() == null ? "" : request.description());
        alarmRequest.setSourceEventId(sourceEventId);
        alarmRequest.setAlarmGroupId("GROUP".equalsIgnoreCase(rule.getAcknowledgementScope()) ? UUID.randomUUID().toString() : null);
        alarmRequest.setOccurredTimestamp(occurredAt);
        alarmRequest.setContext(context(request));
        return alarmRequestRepository.save(alarmRequest);
    }

    private String sourceEventId(AlarmIngressRequest request) {
        if (request.sourceEventId() != null && !request.sourceEventId().isBlank()) return request.sourceEventId().trim();
        if (request.id() != null) return (request.source() == null ? "UNKNOWN" : request.source()) + ":" + request.id();
        return UUID.randomUUID().toString();
    }

    private String context(AlarmIngressRequest request) {
        Map<String, Object> metadata = request.metadata();
        Map<String, Object> values = new java.util.LinkedHashMap<>();
        if (metadata != null) values.putAll(metadata);
        if (request.source() != null) values.putIfAbsent("sourceType", request.source());
        if (request.modelProcessId() != null) values.putIfAbsent("modelProcessId", request.modelProcessId());
        if (values.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(values);
        } catch (Exception exception) {
            return values.entrySet().stream()
                    .map(entry -> entry.getKey() + "=" + String.valueOf(entry.getValue()))
                    .collect(Collectors.joining(";"));
        }
    }
}
