package com.vision.dto;

public record RoleSummaryDto(
        String id,
        String name,
        String description,
        boolean isAdminRole
) {
}
