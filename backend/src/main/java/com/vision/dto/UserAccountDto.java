package com.vision.dto;

import com.vision.entity.UserAccount;
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
        Long orgUnitId,
        String orgUnitName,
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
        UserPersonalizationDto personalization
) {

    public static UserAccountDto from(UserAccount user, String orgUnitName) {
        String role = user.getRole() == null ? "USER" : user.getRole();
        RoleSummaryDto roleSummary = new RoleSummaryDto(
                role.toLowerCase(),
                role,
                "사용자 역할",
                "ADMIN".equalsIgnoreCase(role)
        );
        return UserAccountDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .position(user.getPosition())
                .phone(user.getPhone())
                .orgUnitId(user.getOrgUnitId())
                .orgUnitName(orgUnitName)
                .roleIds(List.of(role.toLowerCase()))
                .roles(List.of(roleSummary))
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
                .build();
    }
}
