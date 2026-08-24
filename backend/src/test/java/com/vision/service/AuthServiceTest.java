package com.vision.service;

import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserAccountRepository userRepository;

    private AuthService service;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        service = new AuthService(userRepository);
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
    void rejectsAccountWithoutPasswordHash() {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user("admin", "ADMIN")));

        ApiException exception = assertThrows(ApiException.class, () -> service.login(new LoginRequest("admin", "admin")));

        assertEquals("AUTH_FAILED", exception.getCode());
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
