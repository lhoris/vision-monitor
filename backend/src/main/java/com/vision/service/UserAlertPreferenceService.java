package com.vision.service;

import com.vision.dto.UpdateUserAlertPreferenceRequest;
import com.vision.dto.UserAlertPreferenceDto;
import com.vision.entity.UserAccount;
import com.vision.entity.UserAlertPreference;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAlertPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserAlertPreferenceService {
    private final UserAccountRepository userRepository;
    private final UserAlertPreferenceRepository preferenceRepository;

    @Transactional(readOnly = true)
    public UserAlertPreferenceDto get(String username) {
        UserAccount user = requireUser(username);
        UserAlertPreference preference = preferenceRepository.findByUserId(user.getId()).orElse(null);
        return toDto(user, preference);
    }

    @Transactional
    public UserAlertPreferenceDto update(String username, UpdateUserAlertPreferenceRequest request) {
        if (request == null) throw new ApiException("VALIDATION_ERROR", "알림 설정을 확인해 주세요.");
        UserAccount user = requireUser(username);
        if (request.emailEnabled() && blank(user.getEmail())) {
            throw new ApiException("CONTACT_REQUIRED", "사용자 계정에 이메일을 먼저 등록해 주세요.");
        }
        if (request.smsEnabled() && blank(user.getPhone())) {
            throw new ApiException("CONTACT_REQUIRED", "사용자 계정에 연락처를 먼저 등록해 주세요.");
        }

        UserAlertPreference preference = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserAlertPreference created = new UserAlertPreference();
                    created.setUserId(user.getId());
                    created.setCreatedObjectId(user.getUsername());
                    created.setCreatedTimestamp(LocalDateTime.now());
                    return created;
                });
        preference.setEmailEnabled(request.emailEnabled() ? "Y" : "N");
        preference.setSmsEnabled(request.smsEnabled() ? "Y" : "N");
        preference.setUpdatedObjectId(user.getUsername());
        preference.setUpdatedTimestamp(LocalDateTime.now());
        return toDto(user, preferenceRepository.save(preference));
    }

    private UserAccount requireUser(String username) {
        if (blank(username)) throw new ApiException("UNAUTHENTICATED", "인증된 사용자가 필요합니다.");
        return userRepository.findByUsernameIgnoreCase(username.trim())
                .filter(user -> !"Y".equalsIgnoreCase(user.getDataEndStatus()))
                .orElseThrow(() -> new ApiException("UNAUTHENTICATED", "인증된 사용자를 찾을 수 없습니다."));
    }

    private UserAlertPreferenceDto toDto(UserAccount user, UserAlertPreference preference) {
        return new UserAlertPreferenceDto(
                user.getEmail(),
                user.getPhone(),
                preference != null && "Y".equalsIgnoreCase(preference.getEmailEnabled()),
                preference != null && "Y".equalsIgnoreCase(preference.getSmsEnabled())
        );
    }

    private boolean blank(String value) { return value == null || value.isBlank(); }
}
