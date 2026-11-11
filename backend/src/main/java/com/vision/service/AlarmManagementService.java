package com.vision.service;

import com.vision.dto.AlarmManagementDto;
import com.vision.entity.CodeDetail;
import com.vision.entity.UserAccount;
import com.vision.entity.UserAlertPreference;
import com.vision.exception.ApiException;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.CodeDetailRepository;
import com.vision.repository.CodeRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAlertPreferenceRepository;
import com.vision.repository.UserAuthorizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AlarmManagementService {
    private static final String ACTIVE = "N";
    private static final String ALARM_TYPE_CODE = "ALARM_TYPE";

    private final CodeRepository codeRepository;
    private final CodeDetailRepository detailRepository;
    private final UserAccountRepository userRepository;
    private final UserAlertPreferenceRepository preferenceRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;

    @Transactional(readOnly = true)
    public AlarmManagementDto.Overview overview(String actorUsername) {
        requireAdmin(actorUsername);
        List<CodeDetail> details = alarmDetails();
        List<String> codes = details.stream().map(CodeDetail::getValue).toList();
        Map<Long, Map<String, AlarmManagementDto.ChannelPolicy>> settings = new HashMap<>();
        preferenceRepository.findAllByAlarmTypeCodeIn(codes).forEach(preference -> settings
                .computeIfAbsent(preference.getUserId(), ignored -> new HashMap<>())
                .put(preference.getAlarmTypeCode(), toChannelPolicy(preference)));
        List<AlarmManagementDto.TypePolicy> types = details.stream().map(this::toTypePolicy).toList();
        List<AlarmManagementDto.UserSetting> users = userRepository.findAll().stream()
                .filter(user -> !"Y".equalsIgnoreCase(user.getDataEndStatus()))
                .map(user -> new AlarmManagementDto.UserSetting(user.getId(), user.getUsername(), user.getName(),
                        settings.getOrDefault(user.getId(), Map.of())))
                .toList();
        return new AlarmManagementDto.Overview(types, users);
    }

    @Transactional
    public AlarmManagementDto.TypePolicy updateType(String actorUsername, Long detailId,
                                                     AlarmManagementDto.TypePolicyUpdate request) {
        requireAdmin(actorUsername);
        if (request == null || !isCategory(request.category()) || !isRecipientScope(request.recipientScope())
                || !isAckScope(request.acknowledgementScope())) {
            throw new ApiException("VALIDATION_ERROR", "알람 정책 값이 올바르지 않습니다.");
        }
        CodeDetail detail = detailRepository.findById(detailId)
                .orElseThrow(() -> new ApiException("CODE_DETAIL_NOT_FOUND", "알람 유형을 찾을 수 없습니다."));
        detail.setAlarmCategory(request.category());
        detail.setRecipientScope(request.recipientScope());
        detail.setAcknowledgementScope(request.acknowledgementScope());
        detail.setDefaultSaveStatus(status(request.defaultSave()));
        detail.setDefaultReceiveStatus(status(request.defaultReceive()));
        detail.setDefaultPushStatus(status(request.defaultPush()));
        detail.setDefaultEmailStatus(status(request.defaultEmail()));
        detail.setDefaultTeamsStatus(status(request.defaultTeams()));
        return toTypePolicy(detailRepository.save(detail));
    }

    @Transactional
    public AlarmManagementDto.UserSetting updateUser(String actorUsername, Long userId,
                                                      AlarmManagementDto.UserSettingUpdate request) {
        requireAdmin(actorUsername);
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));
        if (request == null || request.overrides() == null) {
            throw new ApiException("VALIDATION_ERROR", "알람 수신 설정이 없습니다.");
        }
        List<String> codes = alarmDetails().stream().map(CodeDetail::getValue).toList();
        request.overrides().forEach((code, value) -> {
            if (!codes.contains(code) || value == null) return;
            UserAlertPreference preference = preferenceRepository.findByUserIdAndAlarmTypeCode(userId, code)
                    .orElseGet(() -> newPreference(actorUsername, userId, code));
            preference.setReceiverStatus(status(value.receiver()));
            preference.setReceiveStatus(status(value.receiver()));
            preference.setPushEnabled(status(value.push()));
            preference.setEmailEnabled(status(value.email()));
            preference.setTeamsEnabled(status(value.teams()));
            preference.setUpdatedObjectId(actorUsername);
            preference.setUpdatedTimestamp(LocalDateTime.now());
            preferenceRepository.save(preference);
        });
        return overviewForUser(user);
    }

    private UserAlertPreference newPreference(String actor, Long userId, String code) {
        UserAlertPreference preference = new UserAlertPreference();
        preference.setUserId(userId);
        preference.setAlarmTypeCode(code);
        preference.setCreatedObjectId(actor);
        preference.setCreatedTimestamp(LocalDateTime.now());
        return preference;
    }

    private AlarmManagementDto.UserSetting overviewForUser(UserAccount user) {
        Map<String, AlarmManagementDto.ChannelPolicy> settings = new HashMap<>();
        preferenceRepository.findAllByAlarmTypeCodeIn(alarmDetails().stream().map(CodeDetail::getValue).toList()).stream()
                .filter(preference -> user.getId().equals(preference.getUserId()))
                .forEach(preference -> settings.put(preference.getAlarmTypeCode(), toChannelPolicy(preference)));
        return new AlarmManagementDto.UserSetting(user.getId(), user.getUsername(), user.getName(), settings);
    }

    private List<CodeDetail> alarmDetails() {
        return codeRepository.findByNameIgnoreCase(ALARM_TYPE_CODE)
                .map(code -> detailRepository.findAllByCodeIdAndDataEndStatusOrderBySortOrderAscIdAsc(code.getId(), ACTIVE))
                .orElse(List.of());
    }

    private AlarmManagementDto.TypePolicy toTypePolicy(CodeDetail detail) {
        return new AlarmManagementDto.TypePolicy(detail.getId(), detail.getValue(), detail.getName(), detail.getNameKo(),
                detail.getNameEn(), detail.getDescription(), value(detail.getAlarmCategory(), "GENERAL"),
                value(detail.getRecipientScope(), "ALL_ADMIN"), value(detail.getAcknowledgementScope(), "INDIVIDUAL"),
                enabled(detail.getDefaultSaveStatus(), true), enabled(detail.getDefaultReceiveStatus(), true),
                enabled(detail.getDefaultPushStatus(), true), enabled(detail.getDefaultEmailStatus(), false),
                enabled(detail.getDefaultTeamsStatus(), false));
    }

    private AlarmManagementDto.ChannelPolicy toChannelPolicy(UserAlertPreference preference) {
        return new AlarmManagementDto.ChannelPolicy(enabled(preference.getReceiverStatus(), true),
                enabled(preference.getPushEnabled(), true), enabled(preference.getEmailEnabled(), false),
                enabled(preference.getTeamsEnabled(), false));
    }

    private UserAccount requireAdmin(String username) {
        UserAccount actor = userRepository.findByUsernameIgnoreCase(username == null ? "" : username.trim())
                .orElseThrow(() -> new ApiException("UNAUTHENTICATED", "인증된 사용자가 필요합니다."));
        boolean admin = userAuthorizationRepository.findAllByUserIdAndDataEndStatus(actor.getId(), ACTIVE).stream()
                .map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null))
                .anyMatch(auth -> auth != null && "ADMIN".equalsIgnoreCase(auth.getCode()) && ACTIVE.equals(auth.getDataEndStatus()));
        if (!admin) throw new ApiException("FORBIDDEN", "관리자 권한이 필요합니다.");
        return actor;
    }

    private boolean isCategory(String value) { return "GENERAL".equals(value) || "MODEL".equals(value); }
    private boolean isRecipientScope(String value) { return "ALL_ADMIN".equals(value) || "SELECTED_USER".equals(value); }
    private boolean isAckScope(String value) { return "INDIVIDUAL".equals(value) || "GROUP".equals(value); }
    private boolean enabled(String value, boolean fallback) { return value == null ? fallback : "Y".equalsIgnoreCase(value); }
    private String value(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
    private String status(boolean value) { return value ? "Y" : "N"; }
}
