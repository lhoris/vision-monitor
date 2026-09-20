package com.vision.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
import com.vision.dto.ChangePasswordRequest;
import com.vision.dto.MyProfileDto;
import com.vision.config.AuthSessionInterceptor;
import com.vision.exception.ApiException;
import com.vision.exception.GlobalExceptionHandler;
import com.vision.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.contains;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private final AuthService authService = mock(AuthService.class);
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new AuthController(authService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void returnsLoginSuccessShape() throws Exception {
        when(authService.login(any())).thenReturn(new LoginResponse(
                new AuthenticatedUserDto(1L, "admin", "admin", List.of("admin:access")),
                "dev-auth-token",
                false
        ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin", "admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.id").value(1))
                .andExpect(jsonPath("$.data.user.username").value("admin"))
                .andExpect(jsonPath("$.data.user.role").value("admin"))
                .andExpect(jsonPath("$.data.user.permissions", contains("admin:access")))
                .andExpect(jsonPath("$.data.token").value("dev-auth-token"));
    }

    @Test
    void returnsGenericAuthFailure() throws Exception {
        when(authService.login(any())).thenThrow(new ApiException("AUTH_FAILED", "Invalid username or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("AUTH_FAILED"))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void returnsOnlyTheAuthenticatedUsersProfile() throws Exception {
        AuthenticatedUserDto authenticatedUser = new AuthenticatedUserDto(1L, "tester", "admin", List.of("admin:access"));
        when(authService.getMyProfile("tester")).thenReturn(new MyProfileDto(1L, "tester", "Test User", "admin", "tester@example.com", "01012345678"));

        mockMvc.perform(get("/api/auth/profile")
                        .requestAttr(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE, authenticatedUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("tester"))
                .andExpect(jsonPath("$.data.name").value("Test User"))
                .andExpect(jsonPath("$.data.email").value("tester@example.com"))
                .andExpect(jsonPath("$.data.phone").value("01012345678"));
    }

    @Test
    void changesPasswordForTheAuthenticatedSessionIdentity() throws Exception {
        AuthenticatedUserDto authenticatedUser = new AuthenticatedUserDto(1L, "tester", "admin", List.of("admin:access"));
        mockMvc.perform(post("/api/auth/password")
                        .requestAttr(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE, authenticatedUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ChangePasswordRequest("old-password", "new-password-1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        verify(authService).changePassword("tester", new ChangePasswordRequest("old-password", "new-password-1"));
    }
}
