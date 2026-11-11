package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AlarmManagementDto;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.service.AlarmManagementService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/alarm-management")
@RequiredArgsConstructor
public class AlarmManagementController {
    private final AlarmManagementService service;

    @GetMapping
    public ApiResponse<AlarmManagementDto.Overview> overview(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user) {
        return ApiResponse.success(service.overview(user.username()));
    }

    @PutMapping("/types/{detailId}")
    public ApiResponse<AlarmManagementDto.TypePolicy> updateType(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user,
            @PathVariable Long detailId,
            @RequestBody AlarmManagementDto.TypePolicyUpdate request) {
        return ApiResponse.success(service.updateType(user.username(), detailId, request));
    }

    @PutMapping("/users/{userId}")
    public ApiResponse<AlarmManagementDto.UserSetting> updateUser(
            @RequestAttribute(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE) AuthenticatedUserDto user,
            @PathVariable Long userId,
            @RequestBody AlarmManagementDto.UserSettingUpdate request) {
        return ApiResponse.success(service.updateUser(user.username(), userId, request));
    }
}
