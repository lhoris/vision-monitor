package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
import com.vision.dto.ChangePasswordRequest;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.UserAuthorizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
public class AuthService {

    private static final String ACTIVE = "active";
    private static final String EMPLOYED = "employed";
    private static final String AUTH_FAILED = "AUTH_FAILED";
    private static final String AUTH_FAILED_MESSAGE = "Invalid username or password";

    private final UserAccountRepository userRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public AuthService(
            UserAccountRepository userRepository,
            AuthorizationRepository authorizationRepository,
            UserAuthorizationRepository userAuthorizationRepository
    ) {
        this.userRepository = userRepository;
        this.authorizationRepository = authorizationRepository;
        this.userAuthorizationRepository = userAuthorizationRepository;
    }

    public AuthService(UserAccountRepository userRepository) {
        this(userRepository, null, null);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String username = normalize(request == null ? null : request.username());
        String password = request == null ? null : request.password();
        if (username == null) {
            throw authFailed();
        }

        UserAccount user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(this::authFailed);
        if (!canLogin(user)) {
            throw authFailed();
        }
        boolean passwordChangeRequired = user.getPasswordHash() == null || user.getPasswordHash().isBlank();
        if (!passwordChangeRequired && (password == null || password.isBlank() || !passwordEncoder.matches(password, user.getPasswordHash()))) {
            throw authFailed();
        }

        user.setRole(isAdministrator(user) ? "ADMIN" : "USER");

        return new LoginResponse(AuthenticatedUserDto.from(user), createDevToken(user), passwordChangeRequired);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        String normalizedUsername = normalize(username);
        String newPassword = request == null ? null : request.newPassword();
        if (normalizedUsername == null || newPassword == null || newPassword.length() < 8) {
            throw new ApiException("PASSWORD_INVALID", "비밀번호는 8자 이상이어야 합니다.");
        }
        UserAccount user = userRepository.findByUsernameIgnoreCase(normalizedUsername).orElseThrow(this::authFailed);
        if (!canLogin(user)) throw authFailed();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
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

    private boolean canLogin(UserAccount user) {
        return Boolean.TRUE.equals(user.getEnabled())
                && ACTIVE.equalsIgnoreCase(user.getAccountStatus())
                && EMPLOYED.equalsIgnoreCase(user.getEmploymentStatus())
                && !"Y".equalsIgnoreCase(user.getDataEndStatus());
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
