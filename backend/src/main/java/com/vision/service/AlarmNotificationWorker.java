package com.vision.service;

import com.vision.dto.AlarmLogDto;
import com.vision.entity.AlarmLog;
import com.vision.entity.UserAccount;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.sse.AlarmEventPublisher;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
    private final JavaMailSender mailSender;
    @Value("${vision.alarm.email.from:pd0a5661@posco.com}")
    private String emailFrom;

    @Scheduled(fixedDelayString = "${vision.alarm.worker.fixed-delay-ms:5000}")
    @Transactional
    public void processPendingChannels() {
        processAppChannels();
        processEmailChannels();
        processUnavailableChannel("teams");
    }

    @Transactional
    void processEmailChannels() {
        alarmLogRepository.findTop100ByEmailStatusOrderByIdAsc("PENDING").forEach(alarm -> {
            if (alarmLogRepository.claimEmail(alarm.getId()) != 1) return;
            UserAccount target = userRepository.findById(alarm.getTargetUserId()).orElse(null);
            if (target == null || target.getEmail() == null || target.getEmail().isBlank()) {
                alarmLogRepository.markEmailFailed(alarm.getId());
                return;
            }
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, false, java.nio.charset.StandardCharsets.UTF_8.name());
                helper.setFrom(emailFrom);
                helper.setTo(target.getEmail());
                helper.setSubject(alarm.getEmailSubject() == null || alarm.getEmailSubject().isBlank()
                        ? alarm.getAlarmType() : alarm.getEmailSubject());
                String body = alarm.getEmailBody() == null ? alarm.getMessage() : alarm.getEmailBody();
                helper.setText(body == null ? "" : body, body != null && body.matches("(?s).*<\\/?[a-zA-Z][^>]*>.*"));
                mailSender.send(message);
                alarmLogRepository.markEmailSent(alarm.getId());
            } catch (Exception exception) {
                log.warn("이메일 알람 전송에 실패했습니다. alarmLogId={}", alarm.getId(), exception);
                alarmLogRepository.markEmailFailed(alarm.getId());
            }
        });
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
        var alarms = alarmLogRepository.findTop100ByTeamsStatusOrderByIdAsc("PENDING");
        alarms.forEach(alarm -> {
            int claimed = alarmLogRepository.claimTeams(alarm.getId());
            if (claimed != 1) return;
            log.warn("{} 채널 전송 어댑터가 구성되지 않아 알람을 실패 처리합니다. alarmLogId={}", channel, alarm.getId());
            alarmLogRepository.markTeamsFailed(alarm.getId());
        });
    }
}
