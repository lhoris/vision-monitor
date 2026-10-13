package com.vision.dto;

public record UpdateContactRequest(
        String email,
        String phone
) {
}
