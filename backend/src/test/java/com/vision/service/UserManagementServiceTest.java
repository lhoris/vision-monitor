package com.vision.service;

import com.vision.entity.UserAccount;
import com.vision.dto.UserMutationRequest;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.any;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserAccountRepository userRepository;

    private UserManagementService service;

    @BeforeEach
    void setUp() {
        service = new UserManagementService(userRepository);
    }

    @Test
    void rejectsUnknownOrNonAdminActor() {
        when(userRepository.findByUsernameIgnoreCase(anyString())).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> service.listUsers("unknown", null, null, null, null, 1, 20, "username,asc"));

        assertEquals("UNAUTHENTICATED", exception.getCode());
    }

    @Test
    void protectsTheLastActiveAdministrator() {
        UserAccount admin = user(1L, "admin", "ADMIN");
        UserAccount target = user(2L, "other-admin", "ADMIN");
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.countByRoleIgnoreCaseAndAccountStatusAndEmploymentStatus("ADMIN", "active", "employed"))
                .thenReturn(1L);

        ApiException exception = assertThrows(ApiException.class, () -> service.changeStatus("admin", 2L, "disable", null));

        assertEquals("LAST_ADMIN_RISK", exception.getCode());
    }

    @Test
    void blocksSelfLockoutStatusChanges() {
        UserAccount admin = user(1L, "admin", "ADMIN");
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        ApiException exception = assertThrows(ApiException.class, () -> service.changeStatus("admin", 1L, "retire", null));

        assertEquals("SELF_LOCKOUT_RISK", exception.getCode());
    }

    @Test
    void createsNewUsersWithTheirUsernameAsTheInitialPassword() {
        UserAccount admin = user(1L, "admin", "ADMIN");
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(userRepository.existsByUsernameIgnoreCase("pd0a5661")).thenReturn(false);
        when(userRepository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserMutationRequest request = new UserMutationRequest(
                "pd0a5661", "PD User", null, null, null, null, null,
                List.of("USER"), "active", "employed", false
        );

        service.createUser("admin", request);

        org.mockito.ArgumentCaptor<UserAccount> captor = org.mockito.ArgumentCaptor.forClass(UserAccount.class);
        org.mockito.Mockito.verify(userRepository).save(captor.capture());
        assertTrue(new BCryptPasswordEncoder().matches("pd0a5661", captor.getValue().getPasswordHash()));
    }

    private UserAccount user(Long id, String username, String role) {
        return UserAccount.builder()
                .id(id)
                .username(username)
                .role(role)
                .accountStatus("active")
                .employmentStatus("employed")
                .enabled(true)
                .build();
    }
}
