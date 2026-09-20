package com.vision.dto;

import com.vision.entity.UserAccount;

public record MyProfileDto(Long id, String username, String name, String role, String email, String phone) {
    public static MyProfileDto from(UserAccount user, String role) {
        return new MyProfileDto(
                user.getId(),
                user.getUsername(),
                user.getName(),
                role.toLowerCase(java.util.Locale.ROOT),
                user.getEmail(),
                user.getPhone()
        );
    }
}
