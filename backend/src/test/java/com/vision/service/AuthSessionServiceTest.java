package com.vision.service;

import com.vision.entity.UserAccount;
import com.vision.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthSessionServiceTest {

    private UserAccountRepository userRepository;
    private AuthSessionService service;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserAccountRepository.class);
        service = new AuthSessionService(userRepository);
        user = UserAccount.builder()
                .id(7L)
                .username("admin")
                .role("ADMIN")
                .enabled(true)
                .accountStatus("active")
                .employmentStatus("employed")
                .dataEndStatus("N")
                .build();
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user));
    }

    @Test
    void createsAndResolvesOpaqueSessionToken() {
        String token = service.createSession(user);

        assertThat(token).startsWith("session-");
        assertThat(service.resolveUser(token)).get().extracting("username").isEqualTo("admin");
    }

    @Test
    void rejectsSessionAfterAccountIsDisabled() {
        String token = service.createSession(user);
        user.setEnabled(false);

        assertThat(service.resolveUser(token)).isEmpty();
    }

    @Test
    void rejectsLegacyFrontendMockTokens() {
        assertThat(service.resolveUser("mock-tester-token")).isEmpty();
        assertThat(service.resolveUser("mock-tester1-token")).isEmpty();
    }
}
