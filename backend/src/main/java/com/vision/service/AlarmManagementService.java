package com.vision.service;

import com.vision.dto.AlarmManagementDto;
import com.vision.entity.AlarmRule;
import com.vision.entity.AlarmRuleUser;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.AlarmRuleRepository;
import com.vision.repository.AlarmRuleUserRepository;
import com.vision.repository.UserAccountRepository;
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
    private static final String SIGNUP_REQUEST_ALARM_CODE = "USER_SIGNUP_REQUEST";
    private final AlarmRuleRepository alarmRuleRepository;
    private final AlarmRuleUserRepository alarmRuleUserRepository;
    private final UserAccountRepository userRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;

    @Transactional(readOnly = true)
    public AlarmManagementDto.Overview overview(String actorUsername) {
        requireAdmin(actorUsername);
        return new AlarmManagementDto.Overview(typePolicies(), userSettings());
    }

    @Transactional(readOnly = true)
    public List<AlarmManagementDto.TypePolicy> typePolicies(String actorUsername) {
        requireAdmin(actorUsername);
        return typePolicies();
    }

    @Transactional(readOnly = true)
    public List<AlarmManagementDto.UserSetting> userSettings(String actorUsername) {
        requireAdmin(actorUsername);
        return userSettings();
    }

    @Transactional(readOnly = true)
    public List<AlarmManagementDto.UserSetting> userSettings(String actorUsername, Long alarmRuleId) {
        requireAdmin(actorUsername);
        AlarmRule rule = alarmRuleRepository.findById(alarmRuleId)
                .filter(item -> ACTIVE.equals(item.getDataEndStatus()))
                .orElseThrow(() -> new ApiException("ALARM_RULE_NOT_FOUND", "알람 기준을 찾을 수 없습니다."));
        return userSettings(List.of(rule));
    }

    private List<AlarmManagementDto.TypePolicy> typePolicies() {
        return alarmRules().stream().map(this::toTypePolicy).toList();
    }

    private List<AlarmManagementDto.UserSetting> userSettings() {
        return userSettings(alarmRules());
    }

    private List<AlarmManagementDto.UserSetting> userSettings(List<AlarmRule> rules) {
        List<Long> ruleIds = rules.stream().map(AlarmRule::getId).toList();
        java.util.Set<Long> defaultAdministratorIds = userRepository.findAllActiveAdministrators().stream()
                .map(UserAccount::getId).collect(java.util.stream.Collectors.toSet());
        Map<Long, Map<Long, AlarmManagementDto.ChannelPolicy>> settings = new HashMap<>();
        alarmRuleUserRepository.findAllByAlarmRuleIdIn(ruleIds).forEach(detail -> settings
                .computeIfAbsent(detail.getUserId(), ignored -> new HashMap<>())
                .put(detail.getAlarmRuleId(), toChannelPolicy(detail)));
        List<AlarmManagementDto.UserSetting> users = userRepository.findAll().stream()
                .filter(user -> !"Y".equalsIgnoreCase(user.getDataEndStatus()))
                .map(user -> new AlarmManagementDto.UserSetting(user.getId(), user.getUsername(), user.getName(),
                        effectiveSettings(user, rules, settings, defaultAdministratorIds)))
                .toList();
        return users;
    }

    private Map<String, AlarmManagementDto.ChannelPolicy> effectiveSettings(
            UserAccount user,
            List<AlarmRule> rules,
            Map<Long, Map<Long, AlarmManagementDto.ChannelPolicy>> settings,
            java.util.Set<Long> defaultAdministratorIds) {
        Map<String, AlarmManagementDto.ChannelPolicy> effective = new HashMap<>();
        Map<Long, AlarmManagementDto.ChannelPolicy> configured = settings.getOrDefault(user.getId(), Map.of());
        rules.forEach(rule -> {
            AlarmManagementDto.ChannelPolicy policy = configured.get(rule.getId());
            if (policy != null) effective.put(rule.getCode(), policy);
        });
        if (defaultAdministratorIds.contains(user.getId())) {
            rules.stream().filter(rule -> SIGNUP_REQUEST_ALARM_CODE.equalsIgnoreCase(rule.getCode())).findFirst()
                    .ifPresent(rule -> effective.putIfAbsent(rule.getCode(),
                            new AlarmManagementDto.ChannelPolicy(true, true, false, false)));
        }
        return effective;
    }

    @Transactional
    public AlarmManagementDto.TypePolicy updateType(String actorUsername, Long detailId,
                                                     AlarmManagementDto.TypePolicyUpdate request) {
        requireAdmin(actorUsername);
        if (request == null || (request.category() != null && !isCategory(request.category()))
                || (request.acknowledgementScope() != null && !isAckScope(request.acknowledgementScope()))) {
            throw new ApiException("VALIDATION_ERROR", "알람 정책 값이 올바르지 않습니다.");
        }
        AlarmRule detail = alarmRuleRepository.findById(detailId)
                .orElseThrow(() -> new ApiException("CODE_DETAIL_NOT_FOUND", "알람 유형을 찾을 수 없습니다."));
        if (request.name() != null) detail.setName(request.name().trim());
        if (request.nameKo() != null) detail.setNameKo(request.nameKo().trim());
        if (request.nameEn() != null) detail.setNameEn(request.nameEn().trim());
        if (request.description() != null) detail.setDescription(request.description().trim());
        if (request.category() != null) detail.setCategory(request.category());
        if (request.acknowledgementScope() != null) detail.setAcknowledgementScope(request.acknowledgementScope());
        return toTypePolicy(alarmRuleRepository.save(detail));
    }

    @Transactional
    public AlarmManagementDto.TypePolicy createType(String actorUsername, AlarmManagementDto.TypePolicyCreate request) {
        requireAdmin(actorUsername);
        if (request == null || request.code() == null || request.code().isBlank() || request.name() == null || request.name().isBlank()
                || !isCategory(request.category()) || !isAckScope(request.acknowledgementScope())) {
            throw new ApiException("VALIDATION_ERROR", "알람 기준 입력값이 올바르지 않습니다.");
        }
        String code = request.code().trim();
        if (alarmRuleRepository.existsByCodeIgnoreCaseAndDataEndStatus(code, ACTIVE)) {
            throw new ApiException("DUPLICATE_ALARM_CODE", "이미 등록된 알람 코드입니다.");
        }
        AlarmRule rule = new AlarmRule();
        rule.setCode(code);
        rule.setName(request.name().trim());
        rule.setNameKo(request.nameKo());
        rule.setNameEn(request.nameEn());
        rule.setDescription(request.description());
        rule.setCategory(request.category());
        rule.setAcknowledgementScope(request.acknowledgementScope());
        rule.setCreatedObjectId(actorUsername);
        rule.setCreatedTimestamp(LocalDateTime.now());
        return toTypePolicy(alarmRuleRepository.save(rule));
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
        Map<String, AlarmRule> rulesByCode = alarmRules().stream()
                .collect(java.util.stream.Collectors.toMap(rule -> rule.getCode().toUpperCase(), rule -> rule));
        request.overrides().forEach((code, value) -> {
            AlarmRule rule = code == null ? null : rulesByCode.get(code.toUpperCase());
            if (rule == null || value == null) return;
            AlarmRuleUser detail = alarmRuleUserRepository.findByAlarmRuleIdAndUserId(rule.getId(), userId)
                    .orElseGet(() -> newRuleUser(actorUsername, rule.getId(), userId));
            detail.setReceiverStatus(status(value.receiver()));
            detail.setPushEnabled(status(value.push()));
            detail.setEmailEnabled(status(value.email()));
            detail.setTeamsEnabled(status(value.teams()));
            detail.setUpdatedObjectId(actorUsername);
            detail.setUpdatedTimestamp(LocalDateTime.now());
            alarmRuleUserRepository.save(detail);
        });
        return overviewForUser(user);
    }

    @Transactional
    public void deactivateType(String actorUsername, Long detailId) {
        requireAdmin(actorUsername);
        AlarmRule detail = alarmRuleRepository.findById(detailId)
                .orElseThrow(() -> new ApiException("ALARM_RULE_NOT_FOUND", "알람 기준을 찾을 수 없습니다."));
        detail.setDataEndStatus("Y");
        detail.setDataEndObjectId(actorUsername);
        detail.setDataEndTimestamp(LocalDateTime.now());
        detail.setLastUpdatedObjectId(actorUsername);
        detail.setLastUpdatedTimestamp(LocalDateTime.now());
        alarmRuleRepository.save(detail);
    }

    private AlarmRuleUser newRuleUser(String actor, Long alarmRuleId, Long userId) {
        AlarmRuleUser detail = new AlarmRuleUser();
        detail.setAlarmRuleId(alarmRuleId);
        detail.setUserId(userId);
        detail.setCreatedObjectId(actor);
        detail.setCreatedTimestamp(LocalDateTime.now());
        return detail;
    }

    private AlarmManagementDto.UserSetting overviewForUser(UserAccount user) {
        Map<String, AlarmManagementDto.ChannelPolicy> settings = new HashMap<>();
        Map<Long, AlarmRule> rules = alarmRules().stream().collect(java.util.stream.Collectors.toMap(AlarmRule::getId, rule -> rule));
        alarmRuleUserRepository.findAllByAlarmRuleIdIn(rules.keySet().stream().toList()).stream()
                .filter(detail -> user.getId().equals(detail.getUserId()))
                .forEach(detail -> {
                    AlarmRule rule = rules.get(detail.getAlarmRuleId());
                    if (rule != null) settings.put(rule.getCode(), toChannelPolicy(detail));
                });
        return new AlarmManagementDto.UserSetting(user.getId(), user.getUsername(), user.getName(), settings);
    }

    private List<AlarmRule> alarmRules() {
        return alarmRuleRepository.findAllByDataEndStatusOrderByIdAsc(ACTIVE);
    }

    private AlarmManagementDto.TypePolicy toTypePolicy(AlarmRule detail) {
        return new AlarmManagementDto.TypePolicy(detail.getId(), detail.getCode(), detail.getName(), detail.getNameKo(),
                detail.getNameEn(), detail.getDescription(), value(detail.getCategory(), "GENERAL"),
                value(detail.getAcknowledgementScope(), "INDIVIDUAL"));
    }

    private AlarmManagementDto.ChannelPolicy toChannelPolicy(AlarmRuleUser detail) {
        return new AlarmManagementDto.ChannelPolicy(enabled(detail.getReceiverStatus(), true),
                enabled(detail.getPushEnabled(), true), enabled(detail.getEmailEnabled(), false),
                enabled(detail.getTeamsEnabled(), false));
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
    private boolean isAckScope(String value) { return "INDIVIDUAL".equals(value) || "GROUP".equals(value); }
    private boolean enabled(String value, boolean fallback) { return value == null ? fallback : "Y".equalsIgnoreCase(value); }
    private String value(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
    private String status(boolean value) { return value ? "Y" : "N"; }
}
