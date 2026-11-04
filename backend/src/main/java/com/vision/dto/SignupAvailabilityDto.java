package com.vision.dto;

public record SignupAvailabilityDto(
        boolean usernameAvailable,
        boolean emailAvailable
) {}
