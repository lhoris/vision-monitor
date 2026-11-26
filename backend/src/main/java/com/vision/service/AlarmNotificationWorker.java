package com.vision.service;

import com.vision.dto.AlarmLogDto;
import com.vision.entity.AlarmLog;
import com.vision.entity.UserAccount;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.sse.AlarmEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlarmNotificationWorker {
    private final AlarmLogRepository alarmLogRepository;
    private final UserAccountRepository userRepository;
    private final AlarmEventPublisher alarmEventPublisher;

    @Scheduled(fixedDelayString = "${vision.alarm.worker.fixed-delay-ms:5000}")
    @Transactional
    public void processPendingChannels() {
        processAppChannels();
        processUnavailableChannel("email");
        processUnavailableChannel("teams");
    }

    @Transactional
    void processAppChannels() {
        alarmLogRepository.findTop100ByAppStatusOrderByIdAsc("PENDING").forEach(alarm -> {
            if (alarmLogRepository.claimApp(alarm.getId()) != 1) return;
            UserAccount target = userRepository.findById(alarm.getTargetUserId()).orElse(null);
            if (target == null || target.getUsername() == null || target.getUsername().isBlank()) {
                alarmLogRepository.markAppFailed(alarm.getId());
                return;
            }
            try {
                alarmEventPublisher.publishToUser(target.getUsername(), AlarmLogDto.from(alarm));
                alarmLogRepository.markAppSent(alarm.getId());
            } catch (RuntimeException exception) {
                log.warn("앱 알람 전송에 실패했습니다. alarmLogId={}", alarm.getId(), exception);
                alarmLogRepository.markAppFailed(alarm.getId());
            }
        });
    }

    @Transactional
    void processUnavailableChannel(String channel) {
        var alarms = "email".equals(channel)
                ? alarmLogRepository.findTop100ByEmailStatusOrderByIdAsc("PENDING")
                : alarmLogRepository.findTop100ByTeamsStatusOrderByIdAsc("PENDING");
        alarms.forEach(alarm -> {
            int claimed = "email".equals(channel)
                    ? alarmLogRepository.claimEmail(alarm.getId())
                    : alarmLogRepository.claimTeams(alarm.getId());
            if (claimed != 1) return;
            log.warn("{} 채널 전송 어댑터가 구성되지 않아 알람을 실패 처리합니다. alarmLogId={}", channel, alarm.getId());
            if ("email".equals(channel)) alarmLogRepository.markEmailFailed(alarm.getId());
            else alarmLogRepository.markTeamsFailed(alarm.getId());
        });
    }
}
