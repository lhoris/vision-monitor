package com.vision.service;

import com.vision.entity.AlarmLog;
import com.vision.entity.AlarmRequest;
import com.vision.entity.AlarmRule;
import com.vision.entity.AlarmRuleUser;
import com.vision.entity.UserAccount;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.AlarmRequestRepository;
import com.vision.repository.AlarmRuleRepository;
import com.vision.repository.AlarmRuleUserRepository;
import com.vision.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlarmRequestFanoutWorker {
    private static final String ACTIVE = "N";
    private final AlarmRequestRepository alarmRequestRepository;
    private final AlarmLogRepository alarmLogRepository;
    private final AlarmRuleRepository alarmRuleRepository;
    private final UserAccountRepository userRepository;
    private final AlarmRuleUserRepository alarmRuleUserRepository;

    @Scheduled(fixedDelayString = "${vision.alarm.fanout.fixed-delay-ms:3000}")
    public void processPendingRequests() {
        alarmRequestRepository.findTop100ByOrderByIdAsc().stream()
                .filter(request -> !alarmLogRepository.existsByAlarmRequestId(request.getId()))
                .forEach(this::fanout);
    }

    @Transactional
    void fanout(AlarmRequest request) {
        if (alarmLogRepository.existsByAlarmRequestId(request.getId())) return;
        AlarmRule rule = alarmRuleRepository.findByCodeIgnoreCaseAndDataEndStatus(request.getAlarmCode(), ACTIVE).orElse(null);
        if (rule == null) return;
        List<AlarmRuleUser> configured = alarmRuleUserRepository.findAllByAlarmRuleIdIn(List.of(rule.getId()));
        Map<Long, AlarmRuleUser> preferences = configured.stream()
                .collect(Collectors.toMap(AlarmRuleUser::getUserId, Function.identity(), (first, ignored) -> first));
        List<UserAccount> recipients = recipients(request.getAlarmCode(), preferences);
        for (UserAccount recipient : recipients) {
            if (alarmLogRepository.existsByAlarmRequestIdAndTargetUserId(request.getId(), recipient.getId())) continue;
            AlarmRuleUser preference = preferences.get(recipient.getId());
            boolean app = preference == null || enabled(preference.getPushEnabled(), true);
            boolean email = preference != null && enabled(preference.getEmailEnabled(), false);
            boolean teams = preference != null && enabled(preference.getTeamsEnabled(), false);
            alarmLogRepository.save(AlarmLog.builder()
                    .alarmRequestId(request.getId())
                    .alarmType(request.getAlarmCode())
                    .severity(request.getSeverity())
                    .message(request.getMessage())
                    .sourceType(request.getSourceType())
                    .sourceId(request.getSourceId())
                    .alarmGroupId(request.getAlarmGroupId())
                    .sourceEventId(request.getSourceEventId() + ":" + recipient.getId())
                    .occurredTimestamp(request.getOccurredTimestamp())
                    .targetUserId(recipient.getId())
                    .context(request.getContext())
                    .appStatus(app ? "PENDING" : "SKIPPED")
                    .emailStatus(email ? "PENDING" : "SKIPPED")
                    .teamsStatus(teams ? "PENDING" : "SKIPPED")
                    .build());
        }
    }

    private List<UserAccount> recipients(String alarmCode, Map<Long, AlarmRuleUser> preferences) {
        if (!preferences.isEmpty()) {
            return userRepository.findAllById(preferences.keySet()).stream()
                    .filter(this::active)
                    .filter(user -> enabled(preferences.get(user.getId()).getReceiverStatus(), false))
                    .toList();
        }
        return List.of();
    }

    private boolean active(UserAccount user) {
        return ACTIVE.equalsIgnoreCase(user.getDataEndStatus()) && "active".equalsIgnoreCase(user.getAccountStatus());
    }

    private boolean enabled(String value, boolean fallback) { return value == null ? fallback : "Y".equalsIgnoreCase(value); }
}
