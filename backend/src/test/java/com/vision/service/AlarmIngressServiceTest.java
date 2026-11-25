package com.vision.service;

import com.vision.dto.AlarmIngressRequest;
import com.vision.entity.AlarmRequest;
import com.vision.entity.AlarmRule;
import com.vision.exception.ApiException;
import com.vision.repository.AlarmRequestRepository;
import com.vision.repository.AlarmRuleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlarmIngressServiceTest {
    @Mock AlarmRequestRepository requestRepository;
    @Mock AlarmRuleRepository ruleRepository;

    @Test
    void createsRequestOnlyWhenActiveRuleExists() {
        AlarmRule rule = new AlarmRule();
        rule.setId(11L);
        rule.setCode("MODEL_WARNING");
        rule.setAcknowledgementScope("GROUP");
        when(ruleRepository.findByCodeIgnoreCaseAndDataEndStatus("MODEL_WARNING", "N")).thenReturn(Optional.of(rule));
        when(requestRepository.findBySourceEventId("model-event-1")).thenReturn(Optional.empty());
        when(requestRepository.save(any(AlarmRequest.class))).thenAnswer(invocation -> {
            AlarmRequest request = invocation.getArgument(0);
            request.setId(21L);
            return request;
        });

        AlarmRequest result = new AlarmIngressService(requestRepository, ruleRepository).register(
                new AlarmIngressRequest(1L, "MODEL", "MODEL_WARNING", "warning", 12L,
                        "모델 경고", Instant.parse("2026-11-25T00:00:00Z"), Map.of("cameraId", "1"), "model-event-1"));

        assertEquals(11L, result.getAlarmRuleId());
        assertEquals("model-event-1", result.getSourceEventId());
        assertEquals("MODEL_WARNING", result.getAlarmCode());
        verify(requestRepository).save(any(AlarmRequest.class));
    }

    @Test
    void rejectsRequestWhenActiveRuleDoesNotExist() {
        when(ruleRepository.findByCodeIgnoreCaseAndDataEndStatus("UNKNOWN", "N")).thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> new AlarmIngressService(requestRepository, ruleRepository).register(
                new AlarmIngressRequest(1L, "MODEL", "UNKNOWN", "warning", null,
                        "미등록 알람", Instant.now(), Map.of(), "unknown-event")));
    }
}
