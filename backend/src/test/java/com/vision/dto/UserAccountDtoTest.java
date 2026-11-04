package com.vision.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.entity.UserAccount;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserAccountDtoTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void exposesOnlyResetRequiredStatusWhenPasswordHashIsNull() throws Exception {
        UserAccountDto dto = UserAccountDto.from(user(null));
        String json = objectMapper.writeValueAsString(dto);

        assertTrue(dto.passwordResetRequired());
        assertTrue(json.contains("\"passwordResetRequired\":true"));
    }

    @Test
    void marksConfiguredPasswordAsNotResetRequired() {
        UserAccountDto dto = UserAccountDto.from(user("$2a$10$hash"));

        assertFalse(dto.passwordResetRequired());
    }

    private UserAccount user(String passwordHash) {
        return UserAccount.builder()
                .id(1L)
                .username("tester")
                .passwordHash(passwordHash)
                .accountStatus("active")
                .employmentStatus("employed")
                .build();
    }
}
