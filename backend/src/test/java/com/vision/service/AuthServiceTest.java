package com.vision.service;

import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
import com.vision.dto.ChangePasswordRequest;
import com.vision.dto.MyProfileDto;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import com.vision.sse.AlarmEventPublisher;
import com.vision.repository.AlarmLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.any;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAccountRepository userRepository;

    @Mock
    private AuthSessionService sessionService;

    @Mock
    private AlarmEventPublisher alarmEventPublisher;

    @Mock
    private AlarmLogRepository alarmLogRepository;

    private AuthService service;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        service = new AuthService(userRepository, null, null, sessionService, alarmEventPublisher, alarmLogRepository);
        lenient().when(sessionService.createSession(org.mockito.ArgumentMatchers.any(UserAccount.class)))
                .thenReturn("session-test-token");
    }

    @Test
    void logsInActiveAdminWithMatchingPassword() {
        UserAccount admin = user("admin", "ADMIN");
        admin.setPasswordHash(encoder.encode("admin"));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));

        LoginResponse response = service.login(new LoginRequest("admin", "admin"));

        assertEquals("admin", response.user().username());
        assertEquals("admin", response.user().role());
        assertEquals(1L, response.user().id());
        assertEquals("admin:access", response.user().permissions().getFirst());
        assertNotNull(response.token());
        assertFalse(response.token().isBlank());
    }

    @Test
    void rejectsWrongPasswordWithGenericAuthFailure() {
        UserAccount admin = user("admin", "ADMIN");
        admin.setPasswordHash(encoder.encode("admin"));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));

        ApiException exception = assertThrows(ApiException.class, () -> service.login(new LoginRequest("admin", "wrong")));

        assertEquals("LOGIN_PASSWORD_INVALID", exception.getCode());
        assertEquals("비밀번호가 올바르지 않습니다.", exception.getMessage());
    }

    @Test
    void changesPasswordOnlyAfterVerifyingCurrentPassword() {
        UserAccount account = user("admin", "ADMIN");
        account.setPasswordHash(encoder.encode("old-password"));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(account));

        service.changePassword("admin", new ChangePasswordRequest("old-password", "new-password-1"));

        assertTrue(encoder.matches("new-password-1", account.getPasswordHash()));
        verify(userRepository).save(account);
    }

    @Test
    void rejectsIncorrectCurrentPasswordWithoutChangingAccount() {
        UserAccount account = user("admin", "ADMIN");
        String oldHash = encoder.encode("old-password");
        account.setPasswordHash(oldHash);
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(account));

        ApiException exception = assertThrows(ApiException.class,
                () -> service.changePassword("admin", new ChangePasswordRequest("wrong-password", "new-password-1")));

        assertEquals("CURRENT_PASSWORD_INVALID", exception.getCode());
        assertEquals(oldHash, account.getPasswordHash());
    }

    @Test
    void permitsInitialPasswordSetupWhenAccountHasNoPasswordHash() {
        UserAccount account = user("admin", "ADMIN");
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(account));

        service.changePassword("admin", new ChangePasswordRequest(null, "new-password-1"));

        assertTrue(encoder.matches("new-password-1", account.getPasswordHash()));
        verify(userRepository).save(account);
    }

    @Test
    void returnsTheAuthenticatedUsersManagerRoleInProfile() {
        UserAccount account = user("manager", "MANAGER");
        when(userRepository.findByUsernameIgnoreCase("manager")).thenReturn(Optional.of(account));

        MyProfileDto profile = service.getMyProfile("manager");

        assertEquals("manager", profile.role());
    }

    @Test
    void allowsAccountWithoutPasswordHashAndRequiresChange() {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user("admin", "ADMIN")));

        LoginResponse response = service.login(new LoginRequest("admin", ""));

        assertEquals("admin", response.user().username());
        assertEquals(true, response.passwordChangeRequired());
    }

    @Test
    void allowsResetAccountLoadedWithoutTransientStatusValues() {
        UserAccount account = UserAccount.builder()
                .id(1L)
                .username("admin")
                .role("ADMIN")
                .accountStatus("active")
                .build();
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(account));

        LoginResponse response = service.login(new LoginRequest("admin", "anything"));

        assertEquals("admin", response.user().username());
        assertTrue(response.passwordChangeRequired());
    }

    @Test
    void publishesSignupAlarmToEveryActiveAdministrator() {
        UserAccount admin = user("admin", "ADMIN");
        UserAccount savedSignup = user("new-user", "USER");
        savedSignup.setName("New User");
        when(userRepository.existsByUsernameIgnoreCase("new-user")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("new@example.com")).thenReturn(false);
        when(userRepository.save(any(UserAccount.class))).thenReturn(savedSignup);
        when(userRepository.findAllActiveAdministrators()).thenReturn(java.util.List.of(admin));

        service.signup(new com.vision.dto.SignupRequest(
                "new-user", "password1", "password1", "New User", "new@example.com", "010-1234-5678", "QA", "Engineer"));

        org.mockito.ArgumentCaptor<java.util.Map<String, Object>> alarmCaptor = org.mockito.ArgumentCaptor.forClass(java.util.Map.class);
        verify(alarmLogRepository).save(any(com.vision.entity.AlarmLog.class));
        verify(alarmEventPublisher).publishToUser(org.mockito.ArgumentMatchers.eq("admin"), alarmCaptor.capture());
        assertEquals("USER_SIGNUP_REQUEST", alarmCaptor.getValue().get("type"));
        assertEquals("신규 사용자 가입신청이 접수되었습니다.", alarmCaptor.getValue().get("description"));
    }

    @Test
    void migratesLegacyFoundationPasswordWhenUsernameIsUsed() {
        UserAccount account = user("pd0a5661", "USER");
        account.setPasswordHash("$2a$10$wuWXa/hwpl7jxTu1D6LTWu0GjOiIi.eKs0Pepl5tfBmGhEUZ96Z2a");
        when(userRepository.findByUsernameIgnoreCase("pd0a5661")).thenReturn(Optional.of(account));

        LoginResponse response = service.login(new LoginRequest("pd0a5661", "pd0a5661"));

        assertEquals("pd0a5661", response.user().username());
        assertTrue(encoder.matches("pd0a5661", account.getPasswordHash()));
        verify(userRepository).save(account);
    }

    @Test
    void returnsSpecificMessagesForUnavailableAccountStates() {
        UserAccount disabled = user("disabled", "ADMIN");
        disabled.setPasswordHash(encoder.encode("admin"));
        disabled.setEnabled(false);
        when(userRepository.findByUsernameIgnoreCase("disabled")).thenReturn(Optional.of(disabled));

        UserAccount locked = user("locked", "ADMIN");
        locked.setPasswordHash(encoder.encode("admin"));
        locked.setAccountStatus("locked");
        when(userRepository.findByUsernameIgnoreCase("locked")).thenReturn(Optional.of(locked));

        UserAccount retired = user("retired", "ADMIN");
        retired.setPasswordHash(encoder.encode("admin"));
        retired.setEmploymentStatus("retired");
        when(userRepository.findByUsernameIgnoreCase("retired")).thenReturn(Optional.of(retired));

        ApiException disabledException = assertThrows(ApiException.class, () -> service.login(new LoginRequest("disabled", "admin")));
        ApiException lockedException = assertThrows(ApiException.class, () -> service.login(new LoginRequest("locked", "admin")));
        ApiException retiredException = assertThrows(ApiException.class, () -> service.login(new LoginRequest("retired", "admin")));

        assertEquals("ACCOUNT_DISABLED", disabledException.getCode());
        assertEquals("사용 중지된 계정입니다.", disabledException.getMessage());
        assertEquals("ACCOUNT_LOCKED", lockedException.getCode());
        assertEquals("잠긴 계정입니다.", lockedException.getMessage());
        assertEquals("ACCOUNT_RETIRED", retiredException.getCode());
        assertEquals("퇴직 상태의 계정은 로그인할 수 없습니다.", retiredException.getMessage());
    }

    private UserAccount user(String username, String role) {
        return UserAccount.builder()
                .id(1L)
                .username(username)
                .role(role)
                .enabled(true)
                .accountStatus("active")
                .employmentStatus("employed")
                .build();
    }
}
