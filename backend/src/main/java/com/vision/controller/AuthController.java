package com.vision.controller;

import com.vision.dto.LoginRequest;
import com.vision.dto.LoginResponse;
import com.vision.dto.ChangePasswordRequest;
import com.vision.service.AuthService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.MyProfileDto;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @GetMapping("/session")
    public ApiResponse<AuthenticatedUserDto> session(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        return ApiResponse.success(user);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        authService.logout(extractBearerToken(request.getHeader("Authorization")));
        return ApiResponse.success(null);
    }

    @GetMapping("/profile")
    public ApiResponse<MyProfileDto> profile(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        return ApiResponse.success(authService.getMyProfile(user.username()));
    }

    @PostMapping("/password")
    public ApiResponse<Void> changePassword(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user,
            @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(user.username(), request);
        return ApiResponse.success(null);
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return authorization.substring("Bearer ".length()).trim();
    }
}
