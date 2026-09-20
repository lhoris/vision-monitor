package com.vision.service;

import com.vision.dto.UpdateUserAlertPreferenceRequest;
import com.vision.dto.UserAlertPreferenceDto;
import com.vision.entity.UserAccount;
import com.vision.entity.UserAlertPreference;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAlertPreferenceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserAlertPreferenceServiceTest {
    @Mock private UserAccountRepository userRepository;
    @Mock private UserAlertPreferenceRepository preferenceRepository;
    @InjectMocks private UserAlertPreferenceService service;

    @Test
    void returnsDisabledDefaultsAndAccountContacts() {
        UserAccount user = user();
        user.setEmail("operator@example.com");
        user.setPhone("01012345678");
        when(userRepository.findByUsernameIgnoreCase("operator")).thenReturn(Optional.of(user));
        when(preferenceRepository.findByUserId(7L)).thenReturn(Optional.empty());

        UserAlertPreferenceDto result = service.get("operator");

        assertEquals("operator@example.com", result.email());
        assertEquals("01012345678", result.phone());
        assertFalse(result.emailEnabled());
        assertFalse(result.smsEnabled());
    }

    @Test
    void persistsAccountScopedPreferencesWithAuditIdentity() {
        UserAccount user = user();
        user.setEmail("operator@example.com");
        user.setPhone("01012345678");
        when(userRepository.findByUsernameIgnoreCase("operator")).thenReturn(Optional.of(user));
        when(preferenceRepository.findByUserId(7L)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any(UserAlertPreference.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserAlertPreferenceDto result = service.update("operator", new UpdateUserAlertPreferenceRequest(true, true));

        assertTrue(result.emailEnabled());
        assertTrue(result.smsEnabled());
        verify(preferenceRepository).save(any(UserAlertPreference.class));
    }

    @Test
    void rejectsEnablingAlertsWithoutAccountContact() {
        when(userRepository.findByUsernameIgnoreCase("operator")).thenReturn(Optional.of(user()));

        ApiException error = assertThrows(ApiException.class,
                () -> service.update("operator", new UpdateUserAlertPreferenceRequest(true, false)));

        assertEquals("CONTACT_REQUIRED", error.getCode());
    }

    private UserAccount user() {
        return UserAccount.builder().id(7L).username("operator").dataEndStatus("N").build();
    }
}
