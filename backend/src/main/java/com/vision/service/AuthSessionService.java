package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.entity.UserAccount;
import com.vision.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/** In-memory bearer sessions for the MVP. Restarting the API invalidates sessions. */
@Service
public class AuthSessionService {

    private static final Duration SESSION_TTL = Duration.ofHours(8);
    private final UserAccountRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public AuthSessionService(UserAccountRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String createSession(UserAccount user) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = "session-" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        sessions.put(token, new Session(user.getUsername(), Instant.now().plus(SESSION_TTL)));
        return token;
    }

    public Optional<AuthenticatedUserDto> resolveUser(String token) {
        if (token == null || token.isBlank()) return Optional.empty();

        Session session = sessions.get(token);
        if (session == null) return Optional.empty();
        if (session.expiresAt().isBefore(Instant.now())) {
            sessions.remove(token);
            return Optional.empty();
        }

        return userRepository.findByUsernameIgnoreCase(session.username())
                .filter(this::canLogin)
                .map(AuthenticatedUserDto::from);
    }

    private boolean canLogin(UserAccount user) {
        return Boolean.TRUE.equals(user.getEnabled())
                && "active".equalsIgnoreCase(user.getAccountStatus())
                && "employed".equalsIgnoreCase(user.getEmploymentStatus())
                && !"Y".equalsIgnoreCase(user.getDataEndStatus());
    }

    private record Session(String username, Instant expiresAt) { }
}
