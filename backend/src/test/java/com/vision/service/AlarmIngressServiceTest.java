package com.vision.service;

import com.vision.dto.AlarmIngressRequest;
import com.vision.entity.AlarmLog;
import com.vision.entity.UserAccount;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.AlarmRuleRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAlertPreferenceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlarmIngressServiceTest {
    @Mock AlarmLogRepository alarmLogRepository;
    @Mock AlarmRuleRepository alarmRuleRepository;
    @Mock UserAccountRepository userRepository;
    @Mock UserAlertPreferenceRepository preferenceRepository;

    @Test
    void storesOnePendingAppLogPerDefaultAdministrator() {
        UserAccount admin = UserAccount.builder().id(7L).username("admin").accountStatus("active").build();
        admin.setDataEndStatus("N");
        when(alarmRuleRepository.findByCodeIgnoreCaseAndDataEndStatus("MODEL_WARNING", "N")).thenReturn(java.util.Optional.empty());
        when(preferenceRepository.findAllByAlarmTypeCodeIn(List.of("MODEL_WARNING"))).thenReturn(List.of());
        when(userRepository.findAllActiveAdministrators()).thenReturn(List.of(admin));
        when(alarmLogRepository.existsBySourceEventIdAndTargetUserId("model-event-1", 7L)).thenReturn(false);
        when(alarmLogRepository.save(any(AlarmLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AlarmIngressService service = new AlarmIngressService(alarmLogRepository, alarmRuleRepository, userRepository, preferenceRepository);
        service.register(new AlarmIngressRequest(1L, "MODEL", "MODEL_WARNING", "warning", 12L,
                "모델 경고", Instant.parse("2026-11-25T00:00:00Z"), Map.of("cameraId", "1"), "model-event-1"));

        ArgumentCaptor<AlarmLog> captor = ArgumentCaptor.forClass(AlarmLog.class);
        verify(alarmLogRepository).save(captor.capture());
        assertEquals(7L, captor.getValue().getTargetUserId());
        assertEquals("PENDING", captor.getValue().getAppStatus());
        assertEquals("SKIPPED", captor.getValue().getEmailStatus());
        assertEquals("model-event-1", captor.getValue().getSourceEventId());
    }
}
