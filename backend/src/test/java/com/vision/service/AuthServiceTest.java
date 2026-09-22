package com.vision.service;

import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
import com.vision.dto.ChangePasswordRequest;
import com.vision.dto.MyProfileDto;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
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

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAccountRepository userRepository;

    @Mock
    private AuthSessionService sessionService;

    private AuthService service;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        service = new AuthService(userRepository, null, null, sessionService);
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

        assertEquals("AUTH_FAILED", exception.getCode());
        assertEquals("Invalid username or password", exception.getMessage());
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
    void rejectsDisabledLockedAndRetiredAccountsWithGenericAuthFailure() {
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

        assertEquals("AUTH_FAILED", assertThrows(ApiException.class, () -> service.login(new LoginRequest("disabled", "admin"))).getCode());
        assertEquals("AUTH_FAILED", assertThrows(ApiException.class, () -> service.login(new LoginRequest("locked", "admin"))).getCode());
        assertEquals("AUTH_FAILED", assertThrows(ApiException.class, () -> service.login(new LoginRequest("retired", "admin"))).getCode());
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
