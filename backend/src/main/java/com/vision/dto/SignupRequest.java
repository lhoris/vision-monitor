package com.vision.dto;

public record SignupRequest(
        String username,
        String password,
        String passwordConfirm,
        String name,
        String email,
        String phone,
        String department,
        String position
) {}
