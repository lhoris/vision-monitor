package com.vision.dto;

import java.util.List;

public record UserMutationRequest(
        String username,
        String name,
        String displayName,
        String email,
        String department,
        String position,
        String phone,
        Long orgUnitId,
        List<String> roleIds,
        String accountStatus,
        String employmentStatus
) {
}
