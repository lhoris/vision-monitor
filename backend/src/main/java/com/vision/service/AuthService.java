package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
import com.vision.dto.ChangePasswordRequest;
import com.vision.dto.MyProfileDto;
import com.vision.dto.UpdateContactRequest;
import com.vision.dto.SignupRequest;
import com.vision.dto.UserAccountDto;
import com.vision.dto.SignupAvailabilityDto;
import com.vision.dto.SignupAdminContactDto;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.AuthSessionRepository;
import com.vision.repository.UserAuthorizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;


@Service
public class AuthService {

    private static final String ACTIVE = "active";
    private static final String PENDING = "pending";
    private static final String REJECTED = "rejected";
    private static final String INACTIVE = "inactive";
    private static final String LOCKED = "locked";
    private static final String DISABLED = "disabled";
    private static final String EMPLOYED = "employed";
    private static final String LEAVE = "leave";
    private static final String RETIRED = "retired";
    private static final String AUTH_FAILED = "AUTH_FAILED";
    private static final String LEGACY_FOUNDATION_PASSWORD_HASH = "$2a$10$wuWXa/hwpl7jxTu1D6LTWu0GjOiIi.eKs0Pepl5tfBmGhEUZ96Z2a";

    private final UserAccountRepository userRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;
    private final AuthSessionService sessionService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public AuthService(
            UserAccountRepository userRepository,
            AuthorizationRepository authorizationRepository,
            UserAuthorizationRepository userAuthorizationRepository,
            AuthSessionService sessionService
    ) {
        this.userRepository = userRepository;
        this.authorizationRepository = authorizationRepository;
        this.userAuthorizationRepository = userAuthorizationRepository;
        this.sessionService = sessionService;
    }

    public AuthService(
            UserAccountRepository userRepository,
            AuthorizationRepository authorizationRepository,
            UserAuthorizationRepository userAuthorizationRepository,
            AuthSessionRepository authSessionRepository
    ) {
        this(userRepository, authorizationRepository, userAuthorizationRepository,
                new AuthSessionService(userRepository, authorizationRepository, userAuthorizationRepository, authSessionRepository));
    }

    // 로그인 시 영속 세션을 생성하고 레거시 비밀번호 해시를 갱신할 수 있으므로
    // 대부분의 작업이 조회여도 쓰기가 가능한 트랜잭션이어야 한다.
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String username = normalize(request == null ? null : request.username());
        String password = request == null ? null : request.password();
        if (username == null) {
            throw authFailed();
        }

        UserAccount user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(this::usernameNotFound);
        validateLoginAccount(user);
        boolean passwordChangeRequired = user.getPasswordHash() == null || user.getPasswordHash().isBlank();
        if (!passwordChangeRequired) {
            boolean passwordMatches = password != null
                    && !password.isBlank()
                    && passwordEncoder.matches(password, user.getPasswordHash());
            boolean legacyUsernamePassword = LEGACY_FOUNDATION_PASSWORD_HASH.equals(user.getPasswordHash())
                    && username.equals(password);
            if (!passwordMatches && !legacyUsernamePassword) throw passwordMismatch();
            if (legacyUsernamePassword) {
                user.setPasswordHash(passwordEncoder.encode(username));
                userRepository.save(user);
            }
        }

        user.setRole(isAdministrator(user) ? "ADMIN" : "USER");

        return new LoginResponse(AuthenticatedUserDto.from(user), sessionService.createSession(user), passwordChangeRequired);
    }

    public void logout(String token) {
        sessionService.revokeSession(token);
    }

    @Transactional(readOnly = true)
    public SignupAvailabilityDto checkSignupAvailability(String username, String email) {
        String normalizedUsername = normalize(username);
        String normalizedEmail = normalizeOptional(email);
        return new SignupAvailabilityDto(
                normalizedUsername == null || !userRepository.existsByUsernameIgnoreCase(normalizedUsername),
                normalizedEmail == null || !userRepository.existsByEmailIgnoreCase(normalizedEmail)
        );
    }

    @Transactional(readOnly = true)
    public SignupAdminContactDto getSignupAdminContact() {
        return userRepository.findFirstActiveAdministrator()
                .map(user -> new SignupAdminContactDto(
                        user.getName() == null || user.getName().isBlank() ? user.getUsername() : user.getName(),
                        user.getEmail(),
                        user.getPhone()
                ))
                .orElse(null);
    }

    @Transactional
    public UserAccountDto signup(SignupRequest request) {
        validateSignup(request);
        String username = normalize(request.username());
        String email = normalizeOptional(request.email());
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ApiException("DUPLICATE_USERNAME", "이미 사용 중인 사용자 ID입니다.");
        }
        if (email != null && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다.");
        }
        UserAccount user = UserAccount.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name().trim())
                .email(email)
                .phone(normalizeOptional(request.phone()))
                .department(normalizeOptional(request.department()))
                .position(normalizeOptional(request.position()))
                .accountStatus(PENDING)
                .accountStatusChangedAt(java.time.LocalDateTime.now())
                .accountStatusReason("가입 신청")
                .appliedAt(java.time.LocalDateTime.now())
                .enabled(false)
                .role("USER")
                .employmentStatus("employed")
                .build();
        user.setCreatedBy("SYSTEM");
        user.setUpdatedBy("SYSTEM");
        return UserAccountDto.from(userRepository.save(user));
    }

    @Transactional
    public UserAccountDto reapply(SignupRequest request) {
        validateSignup(request);
        UserAccount user = userRepository.findByUsernameIgnoreCase(normalize(request.username()))
                .orElseThrow(() -> new ApiException("SIGNUP_NOT_FOUND", "재신청할 계정을 찾을 수 없습니다."));
        if (!REJECTED.equalsIgnoreCase(user.getAccountStatus())) {
            throw new ApiException("SIGNUP_NOT_REJECTED", "반려된 계정만 재신청할 수 있습니다.");
        }
        String email = normalizeOptional(request.email());
        if (email != null && !email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPhone(normalizeOptional(request.phone()));
        user.setDepartment(normalizeOptional(request.department()));
        user.setPosition(normalizeOptional(request.position()));
        user.setAccountStatus(PENDING);
        user.setAccountStatusChangedAt(java.time.LocalDateTime.now());
        user.setAccountStatusChangedBy(null);
        user.setAccountStatusReason("재가입 신청");
        user.setAppliedAt(java.time.LocalDateTime.now());
        user.setEnabled(false);
        return UserAccountDto.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        String normalizedUsername = normalize(username);
        String currentPassword = request == null ? null : request.currentPassword();
        String newPassword = request == null ? null : request.newPassword();
        if (normalizedUsername == null || newPassword == null || newPassword.length() < 8) {
            throw new ApiException("PASSWORD_INVALID", "비밀번호는 8자 이상이어야 합니다.");
        }
        UserAccount user = userRepository.findByUsernameIgnoreCase(normalizedUsername).orElseThrow(this::authFailed);
        if (!canLogin(user)) throw authFailed();
        String existingHash = user.getPasswordHash();
        if (existingHash != null && !existingHash.isBlank()
                && (currentPassword == null || !passwordEncoder.matches(currentPassword, existingHash))) {
            throw new ApiException("CURRENT_PASSWORD_INVALID", "현재 비밀번호가 올바르지 않습니다.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public MyProfileDto getMyProfile(String username) {
        String normalizedUsername = normalize(username);
        if (normalizedUsername == null) throw authFailed();
        UserAccount user = userRepository.findByUsernameIgnoreCase(normalizedUsername)
                .filter(this::canLogin)
                .orElseThrow(this::authFailed);
        return MyProfileDto.from(user, resolveRole(user));
    }

    @Transactional
    public MyProfileDto updateContact(String username, UpdateContactRequest request) {
        String normalizedUsername = normalize(username);
        if (normalizedUsername == null || request == null) throw authFailed();
        UserAccount user = userRepository.findByUsernameIgnoreCase(normalizedUsername)
                .filter(this::canLogin)
                .orElseThrow(this::authFailed);
        String email = normalizeOptional(request.email());
        if (email != null && !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ApiException("CONTACT_INVALID", "이메일 형식이 올바르지 않습니다.");
        }
        user.setEmail(email);
        user.setPhone(normalizeOptional(request.phone()));
        user.setUpdatedBy(user.getUsername());
        user.setUpdatedTimestamp(java.time.LocalDateTime.now());
        return MyProfileDto.from(userRepository.save(user), resolveRole(user));
    }

    private String resolveRole(UserAccount user) {
        if (authorizationRepository == null || userAuthorizationRepository == null || user.getId() == null) {
            String role = user.getRole() == null ? "USER" : user.getRole().toUpperCase(Locale.ROOT);
            return switch (role) {
                case "ADMIN", "MANAGER", "USER" -> role;
                default -> "USER";
            };
        }
        var roleCodes = userAuthorizationRepository.findAllByUserIdAndDataEndStatus(user.getId(), "N").stream()
                .map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null))
                .filter(auth -> auth != null && !"Y".equalsIgnoreCase(auth.getDataEndStatus()))
                .map(auth -> auth.getCode() == null ? "" : auth.getCode().toUpperCase(Locale.ROOT))
                .toList();
        if (roleCodes.contains("ADMIN")) return "ADMIN";
        if (roleCodes.contains("MANAGER")) return "MANAGER";
        return "USER";
    }

    private boolean isAdministrator(UserAccount user) {
        if (authorizationRepository == null || userAuthorizationRepository == null || user.getId() == null) {
            return "ADMIN".equalsIgnoreCase(user.getRole());
        }
        return userAuthorizationRepository.findAllByUserIdAndDataEndStatus(user.getId(), "N").stream()
                .map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null))
                .anyMatch(auth -> auth != null && "ADMIN".equalsIgnoreCase(auth.getCode())
                        && !"Y".equalsIgnoreCase(auth.getDataEndStatus()));
    }

    private void validateLoginAccount(UserAccount user) {
        if ("Y".equalsIgnoreCase(user.getDataEndStatus())) {
            throw new ApiException("ACCOUNT_DELETED", "삭제 처리된 계정입니다.");
        }
        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw new ApiException("ACCOUNT_DISABLED", "사용 중지된 계정입니다.");
        }

        String accountStatus = normalizeStatus(user.getAccountStatus(), ACTIVE);
        switch (accountStatus) {
            case PENDING -> throw new ApiException("ACCOUNT_PENDING", "관리자 승인 대기 중인 계정입니다.");
            case REJECTED -> throw new ApiException("ACCOUNT_REJECTED", rejectionMessage(user));
            case INACTIVE -> throw new ApiException("ACCOUNT_INACTIVE", "비활성화된 계정입니다.");
            case LOCKED -> throw new ApiException("ACCOUNT_LOCKED", "잠긴 계정입니다.");
            case DISABLED -> throw new ApiException("ACCOUNT_DISABLED", "사용 중지된 계정입니다.");
            case ACTIVE -> { }
            default -> throw new ApiException("ACCOUNT_INACTIVE", "현재 로그인할 수 없는 계정 상태입니다.");
        }

        String employmentStatus = normalizeStatus(user.getEmploymentStatus(), EMPLOYED);
        if (LEAVE.equals(employmentStatus)) {
            throw new ApiException("ACCOUNT_ON_LEAVE", "휴직 상태의 계정은 로그인할 수 없습니다.");
        }
        if (RETIRED.equals(employmentStatus)) {
            throw new ApiException("ACCOUNT_RETIRED", "퇴직 상태의 계정은 로그인할 수 없습니다.");
        }
        if (!EMPLOYED.equals(employmentStatus)) {
            throw new ApiException("ACCOUNT_INACTIVE", "현재 로그인할 수 없는 재직 상태입니다.");
        }
    }

    private String normalizeStatus(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toLowerCase(Locale.ROOT);
    }

    private String rejectionMessage(UserAccount user) {
        String reason = user.getAccountStatusReason();
        return reason == null || reason.isBlank()
                ? "가입 신청이 반려된 계정입니다."
                : "가입 신청이 반려된 계정입니다. 사유: " + reason;
    }

    private boolean canLogin(UserAccount user) {
        boolean enabled = user.getEnabled() == null || user.getEnabled();
        String employmentStatus = user.getEmploymentStatus() == null ? EMPLOYED : user.getEmploymentStatus();
        return enabled
                && ACTIVE.equalsIgnoreCase(user.getAccountStatus())
                && EMPLOYED.equalsIgnoreCase(employmentStatus)
                && !"Y".equalsIgnoreCase(user.getDataEndStatus());
    }

    private ApiException authFailed() {
        return new ApiException(AUTH_FAILED, "인증에 실패했습니다.");
    }

    private ApiException usernameNotFound() {
        return new ApiException("LOGIN_USERNAME_NOT_FOUND", "사용자 ID를 찾을 수 없습니다.");
    }

    private ApiException passwordMismatch() {
        return new ApiException("LOGIN_PASSWORD_INVALID", "비밀번호가 올바르지 않습니다.");
    }

    private void validateSignup(SignupRequest request) {
        if (request == null || normalize(request.username()) == null || request.username().trim().length() < 2) {
            throw new ApiException("VALIDATION_ERROR", "사용자 ID는 2자 이상 입력해야 합니다.");
        }
        if (request.password() == null || request.password().length() < 8) {
            throw new ApiException("PASSWORD_INVALID", "\uBE44\uBC00\uBC88\uD638\uB294 8\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.");
        }
        if (request.password() == null || request.password().length() < 8) {
            throw new ApiException("PASSWORD_INVALID", "비밀번호는 8자 이상이어야 합니다.");
        }
        if (request.password() == null || request.password().length() < 8) {
            throw new ApiException("VALIDATION_ERROR", "비밀번호는 8자 이상 입력해야 합니다.");
        }
        if (!request.password().equals(request.passwordConfirm())) {
            throw new ApiException("PASSWORD_CONFIRM_MISMATCH", "\uBE44\uBC00\uBC88\uD638\uC640 \uBE44\uBC00\uBC88\uD638 \uD655\uC778\uC774 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
        }
        if (!request.password().equals(request.passwordConfirm())) {
            throw new ApiException("PASSWORD_CONFIRM_MISMATCH", "비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
        if (!request.password().equals(request.passwordConfirm())) {
            throw new ApiException("VALIDATION_ERROR", "비밀번호가 일치하지 않습니다.");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "이름은 필수입니다.");
        }
        String email = normalizeOptional(request.email());
        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ApiException("VALIDATION_ERROR", "올바른 이메일을 입력해야 합니다.");
        }
        String phone = normalizeOptional(request.phone());
        if (phone != null && !phone.matches("^010-\\d{4}-\\d{4}$")) {
            throw new ApiException("VALIDATION_ERROR", "연락처는 010-1234-5678 형식으로 입력해야 합니다.");
        }
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

}
