package com.vision.dto;

public record UserDangerActionRequest(
        String reason,
        String personalizationAction,
        Boolean keepPersonalization,
        Boolean confirmedImpact
) {
}
