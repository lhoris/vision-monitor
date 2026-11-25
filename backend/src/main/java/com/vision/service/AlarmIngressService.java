package com.vision.service;

import com.vision.dto.AlarmIngressRequest;
import com.vision.entity.AlarmLog;
import com.vision.entity.AlarmRule;
import com.vision.entity.UserAccount;
import com.vision.entity.UserAlertPreference;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.AlarmRuleRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAlertPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlarmIngressService {
    private static final String ACTIVE = "N";
    private final AlarmLogRepository alarmLogRepository;
    private final AlarmRuleRepository alarmRuleRepository;
    private final UserAccountRepository userRepository;
    private final UserAlertPreferenceRepository preferenceRepository;

    @Transactional
    public List<AlarmLog> register(AlarmIngressRequest request) {
        if (request == null || request.type() == null || request.type().isBlank()) return List.of();
        String alarmType = request.type().trim();
        AlarmRule rule = alarmRuleRepository.findByCodeIgnoreCaseAndDataEndStatus(alarmType, ACTIVE).orElse(null);
        List<UserAlertPreference> configured = preferenceRepository.findAllByAlarmTypeCodeIn(List.of(alarmType));
        Map<Long, UserAlertPreference> preferences = configured.stream()
                .collect(Collectors.toMap(UserAlertPreference::getUserId, Function.identity(), (first, ignored) -> first));
        List<UserAccount> recipients = recipients(preferences);
        String sourceEventId = request.sourceEventId() == null || request.sourceEventId().isBlank()
                ? request.id() == null ? UUID.randomUUID().toString() : (request.source() + ":" + request.id())
                : request.sourceEventId();
        String groupId = rule != null && "GROUP".equalsIgnoreCase(rule.getAcknowledgementScope())
                ? UUID.randomUUID().toString() : null;
        LocalDateTime occurredAt = request.occurredAt() == null
                ? LocalDateTime.now(ZoneOffset.UTC)
                : LocalDateTime.ofInstant(request.occurredAt(), ZoneOffset.UTC);

        return recipients.stream().filter(recipient -> !alarmLogRepository
                .existsBySourceEventIdAndTargetUserId(sourceEventId, recipient.getId())).map(recipient -> {
            UserAlertPreference preference = preferences.get(recipient.getId());
            boolean app = preference == null || enabled(preference.getPushEnabled(), true);
            boolean email = preference != null && enabled(preference.getEmailEnabled(), false);
            boolean teams = preference != null && enabled(preference.getTeamsEnabled(), false);
            return alarmLogRepository.save(AlarmLog.builder()
                    .alarmType(alarmType)
                    .severity(request.severity() == null ? "info" : request.severity())
                    .message(request.description() == null ? "" : request.description())
                    .sourceType(request.source())
                    .sourceId(request.modelProcessId() == null ? null : String.valueOf(request.modelProcessId()))
                    .sourceEventId(sourceEventId)
                    .alarmGroupId(groupId)
                    .occurredTimestamp(occurredAt)
                    .targetUserId(recipient.getId())
                    .context(context(request))
                    .appStatus(app ? "PENDING" : "SKIPPED")
                    .emailStatus(email ? "PENDING" : "SKIPPED")
                    .teamsStatus(teams ? "PENDING" : "SKIPPED")
                    .build());
        }).toList();
    }

    private List<UserAccount> recipients(Map<Long, UserAlertPreference> preferences) {
        if (!preferences.isEmpty()) {
            return userRepository.findAllById(preferences.keySet()).stream()
                    .filter(this::active)
                    .filter(user -> enabled(preferences.get(user.getId()).getReceiverStatus(), false))
                    .toList();
        }
        return userRepository.findAllActiveAdministrators();
    }

    private boolean active(UserAccount user) {
        return ACTIVE.equalsIgnoreCase(user.getDataEndStatus()) && "active".equalsIgnoreCase(user.getAccountStatus());
    }

    private String context(AlarmIngressRequest request) {
        if (request.metadata() == null || request.metadata().isEmpty()) return null;
        return request.metadata().entrySet().stream()
                .map(entry -> entry.getKey() + "=" + String.valueOf(entry.getValue()))
                .collect(Collectors.joining(";"));
    }

    private boolean enabled(String value, boolean fallback) {
        return value == null ? fallback : "Y".equalsIgnoreCase(value);
    }
}
