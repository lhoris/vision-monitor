package com.vision.service;

import com.vision.entity.AlarmLog;
import com.vision.entity.UserAccount;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.sse.AlarmEventPublisher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlarmNotificationWorkerTest {
    @Mock AlarmLogRepository alarmLogRepository;
    @Mock UserAccountRepository userRepository;
    @Mock AlarmEventPublisher alarmEventPublisher;
    @Mock JavaMailSender mailSender;

    @Test
    void sendsPendingAppAlarmAndMarksItSent() {
        AlarmLog alarm = AlarmLog.builder().id(10L).alarmType("MODEL_WARNING").severity("warning")
                .message("경고").occurredTimestamp(LocalDateTime.now()).targetUserId(7L).build();
        UserAccount user = UserAccount.builder().id(7L).username("admin").build();
        when(alarmLogRepository.findTop100ByAppStatusOrderByIdAsc("PENDING")).thenReturn(List.of(alarm));
        when(alarmLogRepository.claimApp(10L)).thenReturn(1);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(alarmLogRepository.findTop100ByEmailStatusOrderByIdAsc("PENDING")).thenReturn(List.of());
        when(alarmLogRepository.findTop100ByTeamsStatusOrderByIdAsc("PENDING")).thenReturn(List.of());

        new AlarmNotificationWorker(alarmLogRepository, userRepository, alarmEventPublisher, mailSender).processPendingChannels();

        verify(alarmEventPublisher).publishToUser("admin", com.vision.dto.AlarmLogDto.from(alarm));
        verify(alarmLogRepository).markAppSent(10L);
    }
}
