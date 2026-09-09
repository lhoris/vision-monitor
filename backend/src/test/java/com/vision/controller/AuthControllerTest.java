package com.vision.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
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
}
