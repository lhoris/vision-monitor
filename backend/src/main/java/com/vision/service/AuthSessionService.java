package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.entity.AuthSession;
import com.vision.entity.UserAccount;
import com.vision.repository.AuthSessionRepository;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.UserAuthorizationRepository;
import com.vision.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

/** Persistent bearer sessions. Restarting the API does not invalidate active sessions. */
@Service
public class AuthSessionService {

    private static final Duration SESSION_TTL = Duration.ofHours(8);
    private static final String ACTIVE_STATUS = "N";
    private final UserAccountRepository userRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;
    private final AuthSessionRepository sessionRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthSessionService(
            UserAccountRepository userRepository,
            AuthorizationRepository authorizationRepository,
            UserAuthorizationRepository userAuthorizationRepository,
            AuthSessionRepository sessionRepository
    ) {
        this.userRepository = userRepository;
        this.authorizationRepository = authorizationRepository;
        this.userAuthorizationRepository = userAuthorizationRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public String createSession(UserAccount user) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = "session-" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        LocalDateTime now = LocalDateTime.now();
        AuthSession session = new AuthSession();
        session.setUserId(user.getId());
        session.setTokenHash(hashToken(token));
        session.setExpiresTimestamp(now.plus(SESSION_TTL));
        session.setLastAccessedTimestamp(now);
        session.setCreatedTimestamp(now);
        session.setUpdatedTimestamp(now);
        sessionRepository.save(session);
        return token;
    }

    @Transactional
    public Optional<AuthenticatedUserDto> resolveUser(String token) {
        if (token == null || token.isBlank()) return Optional.empty();

        LocalDateTime now = LocalDateTime.now();
        Optional<AuthSession> session = sessionRepository
                .findByTokenHashAndDataEndStatusAndRevokedTimestampIsNullAndExpiresTimestampAfter(
                        hashToken(token), ACTIVE_STATUS, now);
        if (session.isEmpty()) return Optional.empty();

        AuthSession activeSession = session.get();
        activeSession.setLastAccessedTimestamp(now);
        sessionRepository.save(activeSession);

        return userRepository.findById(activeSession.getUserId())
                .filter(this::canLogin)
                .map(user -> AuthenticatedUserDto.from(user, isAdministrator(user)));
    }

    @Transactional
    public void revokeSession(String token) {
        if (token == null || token.isBlank()) return;

        sessionRepository.findByTokenHashAndDataEndStatusAndRevokedTimestampIsNull(
                        hashToken(token), ACTIVE_STATUS)
                .ifPresent(session -> {
                    LocalDateTime now = LocalDateTime.now();
                    session.setRevokedTimestamp(now);
                    session.setLastAccessedTimestamp(now);
                    session.setUpdatedTimestamp(now);
                    session.setDataEndStatus("Y");
                    session.setDataEndTimestamp(now);
                    sessionRepository.save(session);
                });
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private boolean isAdministrator(UserAccount user) {
        if (authorizationRepository == null || userAuthorizationRepository == null || user.getId() == null) {
            return "ADMIN".equalsIgnoreCase(user.getRole());
        }
        return userAuthorizationRepository.findAllByUserIdAndDataEndStatus(user.getId(), "N").stream()
                .map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null))
                .anyMatch(auth -> auth != null
                        && "ADMIN".equalsIgnoreCase(auth.getCode())
                        && !"Y".equalsIgnoreCase(auth.getDataEndStatus()));
    }

    private boolean canLogin(UserAccount user) {
        return Boolean.TRUE.equals(user.getEnabled())
                && "active".equalsIgnoreCase(user.getAccountStatus())
                && "employed".equalsIgnoreCase(user.getEmploymentStatus())
                && !"Y".equalsIgnoreCase(user.getDataEndStatus());
    }

}
