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
        List<String> roleIds,
        String accountStatus,
        String employmentStatus,
        Boolean resetPassword,
        String classCode
) {
    public UserMutationRequest(String username, String name, String displayName, String email,
                               String department, String position, String phone, List<String> roleIds,
                               String accountStatus, String employmentStatus, Boolean resetPassword) {
        this(username, name, displayName, email, department, position, phone, roleIds,
                accountStatus, employmentStatus, resetPassword, null);
    }
}
