package com.vision.dto;

import com.vision.entity.UserAccount;

import java.util.List;

public record AuthenticatedUserDto(
        Long id,
        String username,
        String role,
        List<String> permissions
) {
    public static AuthenticatedUserDto from(UserAccount user) {
        String role = "ADMIN".equalsIgnoreCase(user.getRole()) ? "admin" : "user";
        List<String> permissions = "admin".equals(role) ? List.of("admin:access") : List.of();
        return new AuthenticatedUserDto(user.getId(), user.getUsername(), role, permissions);
    }
}
