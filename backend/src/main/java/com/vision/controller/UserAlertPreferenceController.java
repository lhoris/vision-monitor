package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.UpdateUserAlertPreferenceRequest;
import com.vision.dto.UserAlertPreferenceDto;
import com.vision.service.UserAlertPreferenceService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/notification-settings")
@RequiredArgsConstructor
public class UserAlertPreferenceController {
    private final UserAlertPreferenceService service;

    @GetMapping
    public ApiResponse<UserAlertPreferenceDto> get(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user
    ) {
        return ApiResponse.success(service.get(user.username()));
    }

    @PutMapping
    public ApiResponse<UserAlertPreferenceDto> update(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user,
            @RequestBody UpdateUserAlertPreferenceRequest request
    ) {
        return ApiResponse.success(service.update(user.username(), request));
    }
}
