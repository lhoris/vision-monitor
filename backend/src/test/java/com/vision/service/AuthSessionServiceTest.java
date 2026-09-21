package com.vision.service;

import com.vision.entity.UserAccount;
import com.vision.entity.Authorization;
import com.vision.entity.UserAuthorization;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAuthorizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static java.util.List.of;

class AuthSessionServiceTest {

    private UserAccountRepository userRepository;
    private AuthorizationRepository authorizationRepository;
    private UserAuthorizationRepository userAuthorizationRepository;
    private AuthSessionService service;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserAccountRepository.class);
        authorizationRepository = mock(AuthorizationRepository.class);
        userAuthorizationRepository = mock(UserAuthorizationRepository.class);
        service = new AuthSessionService(userRepository, authorizationRepository, userAuthorizationRepository);
        user = UserAccount.builder()
                .id(7L)
                .username("admin")
                .enabled(true)
                .accountStatus("active")
                .employmentStatus("employed")
                .dataEndStatus("N")
                .build();
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user));
    }

    @Test
    void createsAndResolvesOpaqueSessionToken() {
        when(userAuthorizationRepository.findAllByUserIdAndDataEndStatus(7L, "N"))
                .thenReturn(of(UserAuthorization.builder().userId(7L).authId(3L).dataEndStatus("N").build()));
        when(authorizationRepository.findById(3L))
                .thenReturn(Optional.of(Authorization.builder().code("ADMIN").dataEndStatus("N").build()));
        String token = service.createSession(user);

        assertThat(token).startsWith("session-");
        assertThat(service.resolveUser(token)).get().extracting("username").isEqualTo("admin");
        assertThat(service.resolveUser(token)).get().extracting("role").isEqualTo("admin");
        assertThat(service.resolveUser(token)).get().extracting("permissions").isEqualTo(of("admin:access"));
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
