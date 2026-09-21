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
        return from(user, "ADMIN".equalsIgnoreCase(user.getRole()));
    }

    public static AuthenticatedUserDto from(UserAccount user, boolean administrator) {
        String role = administrator ? "admin" : "user";
        List<String> permissions = "admin".equals(role) ? List.of("admin:access") : List.of();
        return new AuthenticatedUserDto(user.getId(), user.getUsername(), role, permissions);
    }
}
