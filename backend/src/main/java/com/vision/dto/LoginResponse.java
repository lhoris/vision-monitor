package com.vision.dto;

public record LoginResponse(
        AuthenticatedUserDto user,
        String token,
        boolean passwordChangeRequired
) {
}
