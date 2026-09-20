package com.vision.dto;

public record ChangePasswordRequest(String currentPassword, String newPassword) {
}
