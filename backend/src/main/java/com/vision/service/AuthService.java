package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ACTIVE = "active";
    private static final String EMPLOYED = "employed";
    private static final String AUTH_FAILED = "AUTH_FAILED";
    private static final String AUTH_FAILED_MESSAGE = "Invalid username or password";

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String username = normalize(request == null ? null : request.username());
        String password = request == null ? null : request.password();
        if (username == null || password == null || password.isBlank()) {
            throw authFailed();
        }

        UserAccount user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(this::authFailed);
        if (!canLogin(user) || user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw authFailed();
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw authFailed();
        }

        return new LoginResponse(AuthenticatedUserDto.from(user), createDevToken(user));
    }

    private boolean canLogin(UserAccount user) {
        return Boolean.TRUE.equals(user.getEnabled())
                && ACTIVE.equalsIgnoreCase(user.getAccountStatus())
                && EMPLOYED.equalsIgnoreCase(user.getEmploymentStatus());
    }

    private ApiException authFailed() {
        return new ApiException(AUTH_FAILED, AUTH_FAILED_MESSAGE);
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String createDevToken(UserAccount user) {
        String input = user.getId() + ":" + user.getUsername() + ":" + Instant.now();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return "dev-auth-token-" + HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 digest is not available", exception);
        }
    }
}
