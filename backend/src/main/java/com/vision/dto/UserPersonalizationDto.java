package com.vision.dto;

public record UserPersonalizationDto(
        boolean hasSettings,
        int cameraGridCount,
        String lastUpdatedAt
) {
}
