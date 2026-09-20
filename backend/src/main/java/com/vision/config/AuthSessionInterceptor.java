package com.vision.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.service.AuthSessionService;
import com.vision.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class AuthSessionInterceptor implements HandlerInterceptor {

    public static final String AUTHENTICATED_USER_ATTRIBUTE = "authenticatedUser";

    private final AuthSessionService sessionService;
    private final ObjectMapper objectMapper;

    public AuthSessionInterceptor(AuthSessionService sessionService, ObjectMapper objectMapper) {
        this.sessionService = sessionService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String token = extractBearerToken(request.getHeader("Authorization"));
        Optional<AuthenticatedUserDto> user = sessionService.resolveUser(token);
        if (user.isEmpty()) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "AUTH_REQUIRED", "Authentication is required");
            return false;
        }

        String actorUsername = request.getHeader("X-Actor-Username");
        if (actorUsername != null && !actorUsername.isBlank()
                && !user.get().username().equalsIgnoreCase(actorUsername.trim())) {
            writeError(response, HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN", "The actor does not match the authenticated user");
            return false;
        }

        request.setAttribute(AUTHENTICATED_USER_ATTRIBUTE, user.get());
        return true;
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return authorization.substring("Bearer ".length()).trim();
    }

    private void writeError(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(code, message)));
    }
}
