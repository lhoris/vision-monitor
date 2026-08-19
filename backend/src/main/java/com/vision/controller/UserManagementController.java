package com.vision.controller;

import com.vision.dto.OrgUnitDto;
import com.vision.dto.UserAccountDto;
import com.vision.dto.UserDangerActionRequest;
import com.vision.dto.UserListResponse;
import com.vision.dto.UserMutationRequest;
import com.vision.service.UserManagementService;
import com.vision.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping("/org-units")
    public ApiResponse<List<OrgUnitDto>> listOrgUnits(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) String unitType,
            @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        return ApiResponse.success(userManagementService.listOrgUnits(actorUsername, parentId, unitType, activeOnly));
    }

    @GetMapping("/users")
    public ApiResponse<UserListResponse> listUsers(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long orgUnitId,
            @RequestParam(required = false) String roleId,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(required = false) String employmentStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "username,asc") String sort
    ) {
        return ApiResponse.success(userManagementService.listUsers(actorUsername, query, orgUnitId, roleId, accountStatus, employmentStatus, page, pageSize, sort));
    }

    @GetMapping("/users/{userId}")
    public ApiResponse<UserAccountDto> getUser(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @PathVariable Long userId
    ) {
        return ApiResponse.success(userManagementService.getUser(actorUsername, userId));
    }

    @PostMapping("/users")
    public ApiResponse<UserAccountDto> createUser(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @RequestBody UserMutationRequest request
    ) {
        return ApiResponse.success(userManagementService.createUser(actorUsername, request));
    }

    @PutMapping("/users/{userId}")
    public ApiResponse<UserAccountDto> updateUser(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @PathVariable Long userId,
            @RequestBody UserMutationRequest request
    ) {
        return ApiResponse.success(userManagementService.updateUser(actorUsername, userId, request));
    }

    @PostMapping("/users/{userId}/lock")
    public ApiResponse<UserAccountDto> lockUser(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @PathVariable Long userId,
            @RequestBody(required = false) UserDangerActionRequest request
    ) {
        return ApiResponse.success(userManagementService.changeStatus(actorUsername, userId, "lock", request));
    }

    @PostMapping("/users/{userId}/unlock")
    public ApiResponse<UserAccountDto> unlockUser(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @PathVariable Long userId,
            @RequestBody(required = false) UserDangerActionRequest request
    ) {
        return ApiResponse.success(userManagementService.changeStatus(actorUsername, userId, "unlock", request));
    }

    @PostMapping("/users/{userId}/disable")
    public ApiResponse<UserAccountDto> disableUser(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @PathVariable Long userId,
            @RequestBody(required = false) UserDangerActionRequest request
    ) {
        return ApiResponse.success(userManagementService.changeStatus(actorUsername, userId, "disable", request));
    }

    @PostMapping("/users/{userId}/retire")
    public ApiResponse<UserAccountDto> retireUser(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @PathVariable Long userId,
            @RequestBody UserDangerActionRequest request
    ) {
        return ApiResponse.success(userManagementService.changeStatus(actorUsername, userId, "retire", request));
    }

    @PostMapping("/users/{userId}/delete-request")
    public ApiResponse<UserAccountDto> requestDelete(
            @RequestHeader(value = "X-Actor-Username", required = false) String actorUsername,
            @PathVariable Long userId,
            @RequestBody UserDangerActionRequest request
    ) {
        return ApiResponse.success(userManagementService.changeStatus(actorUsername, userId, "delete-request", request));
    }
}
