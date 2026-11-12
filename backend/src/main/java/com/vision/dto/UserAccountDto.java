package com.vision.dto;

import com.vision.entity.UserAccount;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record UserAccountDto(
        Long id,
        String username,
        String name,
        String displayName,
        String email,
        String department,
        String position,
        String phone,
        String classCode,
        List<String> roleIds,
        List<RoleSummaryDto> roles,
        String accountStatus,
        String employmentStatus,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy,
        Long version,
        boolean deletionRequested,
        UserPersonalizationDto personalization,
        String employeeNo,
        String remarks,
        String dataEndStatus,
        LocalDateTime accountStatusChangedAt,
        Long accountStatusChangedBy,
        String accountStatusReason,
        LocalDateTime appliedAt,
        @JsonProperty("passwordResetRequired") boolean passwordResetRequired
) {

    public static UserAccountDto from(UserAccount user) {
        return from(user, List.of());
    }

    public static UserAccountDto from(UserAccount user, List<RoleSummaryDto> availableRoles) {
        return from(user, availableRoles, List.of(user.getRole() == null ? "USER" : user.getRole().toLowerCase()));
    }

    public static UserAccountDto from(UserAccount user, List<RoleSummaryDto> availableRoles, List<String> assignedRoleIds) {
        String role = user.getRole() == null ? "USER" : user.getRole();
        boolean systemAdmin = "ADMIN".equalsIgnoreCase(role);
        boolean passwordResetRequired = user.getPasswordHash() == null || user.getPasswordHash().isBlank();
        RoleSummaryDto roleSummary = availableRoles.stream()
                .filter(candidate -> candidate.id().equalsIgnoreCase(role) || candidate.name().equalsIgnoreCase(role))
                .findFirst()
                .orElseGet(() -> new RoleSummaryDto(
                        role.toLowerCase(),
                        role,
                        switch (role.toUpperCase()) {
                            case "ADMIN" -> "최고관리자 역할";
                            case "MANAGER" -> "관리자 역할";
                            default -> "일반 사용자 역할";
                        },
                        systemAdmin
                ));
        return UserAccountDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .displayName(user.getRemarks())
                .email(user.getEmail())
                .department(user.getDepartment())
                .position(user.getPosition())
                .phone(user.getPhone())
                .classCode(user.getClassCode())
                .roleIds(assignedRoleIds == null || assignedRoleIds.isEmpty() ? List.of(role.toLowerCase()) : assignedRoleIds)
                .roles((assignedRoleIds == null || assignedRoleIds.isEmpty() ? List.of(role.toLowerCase()) : assignedRoleIds).stream()
                        .map(roleId -> availableRoles.stream()
                                .filter(candidate -> candidate.id().equalsIgnoreCase(roleId) || candidate.name().equalsIgnoreCase(roleId))
                                .findFirst()
                                .orElse(roleSummary))
                        .distinct()
                        .toList())
                .accountStatus(user.getAccountStatus())
                .employmentStatus(user.getEmploymentStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .createdBy(user.getCreatedBy())
                .updatedAt(user.getUpdatedAt())
                .updatedBy(user.getUpdatedBy())
                .version(user.getVersion())
                .deletionRequested(user.getDeletionRequestedAt() != null)
                .personalization(new UserPersonalizationDto(false, 0, null))
                .employeeNo(user.getUsername())
                .remarks(user.getRemarks())
                .dataEndStatus(user.getDataEndStatus())
                .accountStatusChangedAt(user.getAccountStatusChangedAt())
                .accountStatusChangedBy(user.getAccountStatusChangedBy())
                .accountStatusReason(user.getAccountStatusReason())
                .appliedAt(user.getAppliedAt())
                .passwordResetRequired(passwordResetRequired)
                .build();
    }
}
