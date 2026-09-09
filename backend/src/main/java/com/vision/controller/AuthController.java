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
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/password")
    public ApiResponse<Void> changePassword(
            @RequestHeader("X-Actor-Username") String username,
            @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(username, request);
        return ApiResponse.success(null);
    }
}
