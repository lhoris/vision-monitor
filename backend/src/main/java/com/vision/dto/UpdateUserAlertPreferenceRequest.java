package com.vision.dto;

public record UpdateUserAlertPreferenceRequest(boolean emailEnabled, boolean smsEnabled) { }
