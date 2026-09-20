package com.vision.dto;

public record UserAlertPreferenceDto(
        String email,
        String phone,
        boolean emailEnabled,
        boolean smsEnabled
) { }
