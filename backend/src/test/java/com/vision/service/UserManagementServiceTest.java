package com.vision.service;

import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.OrgUnitRepository;
import com.vision.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserAccountRepository userRepository;

    @Mock
    private OrgUnitRepository orgUnitRepository;

    private UserManagementService service;

    @BeforeEach
    void setUp() {
        service = new UserManagementService(userRepository, orgUnitRepository);
    }

    @Test
    void rejectsUnknownOrNonAdminActor() {
        when(userRepository.findByUsernameIgnoreCase(anyString())).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> service.listUsers("unknown", null, null, null, null, null, 1, 20, "username,asc"));

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
