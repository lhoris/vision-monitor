package com.vision.dto;

public record SignupRequest(
        String username,
        String password,
        String passwordConfirm,
        String name,
        String email,
        String phone,
        String department,
        String position,
        String classCode
) {
    public SignupRequest(String username, String password, String passwordConfirm, String name,
                         String email, String phone, String department, String position) {
        this(username, password, passwordConfirm, name, email, phone, department, position, "COMMON");
    }
}
