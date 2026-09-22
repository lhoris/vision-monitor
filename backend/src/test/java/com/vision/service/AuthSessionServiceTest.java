package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.entity.AuthSession;
import com.vision.entity.Authorization;
import com.vision.entity.UserAccount;
import com.vision.entity.UserAuthorization;
import com.vision.repository.AuthSessionRepository;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAuthorizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static java.util.List.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthSessionServiceTest {

    private UserAccountRepository userRepository;
    private AuthorizationRepository authorizationRepository;
    private UserAuthorizationRepository userAuthorizationRepository;
    private AuthSessionRepository sessionRepository;
    private AuthSessionService service;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserAccountRepository.class);
        authorizationRepository = mock(AuthorizationRepository.class);
        userAuthorizationRepository = mock(UserAuthorizationRepository.class);
        sessionRepository = mock(AuthSessionRepository.class);
        service = new AuthSessionService(userRepository, authorizationRepository, userAuthorizationRepository, sessionRepository);
        user = UserAccount.builder()
                .id(7L)
                .username("admin")
                .enabled(true)
                .accountStatus("active")
                .employmentStatus("employed")
                .dataEndStatus("N")
                .build();
        when(sessionRepository.save(any(AuthSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
    }

    @Test
    void createsAndResolvesOpaqueSessionTokenWithoutStoringRawToken() {
        when(userAuthorizationRepository.findAllByUserIdAndDataEndStatus(7L, "N"))
                .thenReturn(of(UserAuthorization.builder().userId(7L).authId(3L).dataEndStatus("N").build()));
        when(authorizationRepository.findById(3L))
                .thenReturn(Optional.of(Authorization.builder().code("ADMIN").dataEndStatus("N").build()));
        String token = service.createSession(user);
        AuthSession stored = savedSession();
        when(sessionRepository.findByTokenHashAndDataEndStatusAndRevokedTimestampIsNullAndExpiresTimestampAfter(
                eq(stored.getTokenHash()), eq("N"), any(LocalDateTime.class))).thenReturn(Optional.of(stored));

        Optional<AuthenticatedUserDto> resolved = service.resolveUser(token);

        assertThat(token).startsWith("session-");
        assertThat(stored.getTokenHash()).doesNotContain(token);
        assertThat(resolved).get().extracting("username").isEqualTo("admin");
        assertThat(resolved).get().extracting("role").isEqualTo("admin");
        assertThat(resolved).get().extracting("permissions").isEqualTo(of("admin:access"));
    }

    @Test
    void rejectsSessionAfterAccountIsDisabled() {
        String token = service.createSession(user);
        AuthSession stored = savedSession();
        when(sessionRepository.findByTokenHashAndDataEndStatusAndRevokedTimestampIsNullAndExpiresTimestampAfter(
                eq(stored.getTokenHash()), eq("N"), any(LocalDateTime.class))).thenReturn(Optional.of(stored));
        user.setEnabled(false);

        assertThat(service.resolveUser(token)).isEmpty();
    }

    @Test
    void rejectsExpiredAndRevokedSessions() {
        String token = service.createSession(user);
        AuthSession stored = savedSession();
        when(sessionRepository.findByTokenHashAndDataEndStatusAndRevokedTimestampIsNullAndExpiresTimestampAfter(
                eq(stored.getTokenHash()), eq("N"), any(LocalDateTime.class))).thenReturn(Optional.empty());

        assertThat(service.resolveUser(token)).isEmpty();

        when(sessionRepository.findByTokenHashAndDataEndStatusAndRevokedTimestampIsNull(
                eq(stored.getTokenHash()), eq("N"))).thenReturn(Optional.of(stored));
        service.revokeSession(token);

        assertThat(stored.getDataEndStatus()).isEqualTo("Y");
        assertThat(stored.getRevokedTimestamp()).isNotNull();
    }

    @Test
    void rejectsLegacyFrontendMockTokens() {
        assertThat(service.resolveUser("mock-tester-token")).isEmpty();
        assertThat(service.resolveUser("mock-tester1-token")).isEmpty();
    }

    private AuthSession savedSession() {
        org.mockito.ArgumentCaptor<AuthSession> captor = org.mockito.ArgumentCaptor.forClass(AuthSession.class);
        org.mockito.Mockito.verify(sessionRepository, org.mockito.Mockito.atLeastOnce()).save(captor.capture());
        return captor.getValue();
    }
}
