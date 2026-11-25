package com.vision.service;

import com.vision.entity.AlarmRequest;
import com.vision.entity.AlarmRule;
import com.vision.entity.AlarmRuleUser;
import com.vision.entity.UserAccount;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.AlarmRequestRepository;
import com.vision.repository.AlarmRuleRepository;
import com.vision.repository.AlarmRuleUserRepository;
import com.vision.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlarmRequestFanoutWorkerTest {
    @Mock AlarmRequestRepository requestRepository;
    @Mock AlarmLogRepository logRepository;
    @Mock AlarmRuleRepository ruleRepository;
    @Mock UserAccountRepository userRepository;
    @Mock AlarmRuleUserRepository ruleUserRepository;

    @Test
    void createsOneLogPerDefaultAdministrator() {
        AlarmRequest request = new AlarmRequest();
        request.setId(10L);
        request.setAlarmRuleId(20L);
        request.setAlarmCode("MODEL_WARNING");
        request.setSeverity("warning");
        request.setMessage("경고");
        request.setSourceEventId("event-1");
        request.setOccurredTimestamp(LocalDateTime.now());
        UserAccount admin = UserAccount.builder().id(7L).username("admin").accountStatus("active").build();
        admin.setDataEndStatus("N");
        when(requestRepository.findTop100ByOrderByIdAsc()).thenReturn(List.of(request));
        when(logRepository.existsByAlarmRequestId(10L)).thenReturn(false);
        AlarmRule rule = new AlarmRule();
        rule.setId(20L);
        rule.setCode("MODEL_WARNING");
        when(ruleRepository.findByCodeIgnoreCaseAndDataEndStatus("MODEL_WARNING", "N")).thenReturn(java.util.Optional.of(rule));
        AlarmRuleUser ruleUser = new AlarmRuleUser();
        ruleUser.setAlarmRuleId(20L);
        ruleUser.setUserId(7L);
        when(ruleUserRepository.findAllByAlarmRuleIdIn(List.of(20L))).thenReturn(List.of(ruleUser));
        when(userRepository.findAllById(any())).thenReturn(List.of(admin));
        when(logRepository.existsByAlarmRequestIdAndTargetUserId(10L, 7L)).thenReturn(false);

        new AlarmRequestFanoutWorker(requestRepository, logRepository, ruleRepository, userRepository, ruleUserRepository).processPendingRequests();

        ArgumentCaptor<com.vision.entity.AlarmLog> captor = ArgumentCaptor.forClass(com.vision.entity.AlarmLog.class);
        verify(logRepository).save(captor.capture());
        assertEquals(10L, captor.getValue().getAlarmRequestId());
        assertEquals(7L, captor.getValue().getTargetUserId());
    }
}
