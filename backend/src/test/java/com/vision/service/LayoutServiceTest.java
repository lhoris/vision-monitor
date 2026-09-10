package com.vision.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.dto.LayoutDto;
import com.vision.entity.Layout;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.LayoutRepository;
import com.vision.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LayoutServiceTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Mock
    private LayoutRepository layoutRepository;

    @Mock
    private UserAccountRepository userRepository;

    private LayoutService service;

    @BeforeEach
    void setUp() {
        service = new LayoutService(layoutRepository, userRepository);
    }

    @Test
    void getsCurrentUserLayout() throws Exception {
        UserAccount admin = user(1L, "admin");
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(layoutRepository.findFirstByUserIdAndTabNameOrderByIdAsc(1L, "dashboard")).thenReturn(Optional.of(layout(10L, 1L)));

        LayoutDto response = service.getMyLayout("admin");

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals("tab-1", response.getActiveTab());
        assertEquals(1, response.getTabs().size());
        assertEquals("theme3", response.getTheme().getMode());
    }

    @Test
    void returnsNullWhenCurrentUserHasNoLayout() {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user(1L, "admin")));
        when(layoutRepository.findFirstByUserIdAndTabNameOrderByIdAsc(1L, "dashboard")).thenReturn(Optional.empty());
        when(layoutRepository.findFirstByUserIdOrderByIdAsc(1L)).thenReturn(Optional.empty());

        assertNull(service.getMyLayout("admin"));
    }

    @Test
    void rejectsMissingActor() {
        ApiException exception = assertThrows(ApiException.class, () -> service.getMyLayout(null));

        assertEquals("AUTH_REQUIRED", exception.getCode());
    }

    @Test
    void createsCurrentUserLayoutAndIgnoresRequestUserId() throws Exception {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user(1L, "admin")));
        when(layoutRepository.findFirstByUserIdAndTabNameOrderByIdAsc(1L, "dashboard")).thenReturn(Optional.empty());
        when(layoutRepository.findFirstByUserIdOrderByIdAsc(1L)).thenReturn(Optional.empty());
        when(layoutRepository.save(any(Layout.class))).thenAnswer(invocation -> {
            Layout saved = invocation.getArgument(0);
            saved.setId(33L);
            return saved;
        });

        LayoutDto request = dto(999L);
        LayoutDto response = service.saveMyLayout("admin", request);

        assertEquals(33L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals("dashboard", response.getTabName());
        assertEquals("theme3", response.getTheme().getMode());
        verify(layoutRepository).deleteByUserIdAndTabNameAndIdNot(1L, "dashboard", 33L);
    }

    @Test
    void updatesExistingCurrentUserLayout() throws Exception {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user(1L, "admin")));
        when(layoutRepository.findFirstByUserIdAndTabNameOrderByIdAsc(1L, "dashboard")).thenReturn(Optional.of(layout(10L, 1L)));
        when(layoutRepository.save(any(Layout.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LayoutDto response = service.saveMyLayout("admin", dto(999L));

        assertEquals(10L, response.getId());
        assertEquals(1L, response.getUserId());
    }

    @Test
    void rejectsInvalidLayout() throws Exception {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user(1L, "admin")));
        LayoutDto request = LayoutDto.builder()
                .activeTab("tab-1")
                .tabs(MAPPER.readTree("[]"))
                .build();

        ApiException exception = assertThrows(ApiException.class, () -> service.saveMyLayout("admin", request));

        assertEquals("INVALID_LAYOUT", exception.getCode());
    }

    @Test
    void rejectsInvalidThemeMode() throws Exception {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(user(1L, "admin")));
        LayoutDto request = dto(1L);
        request.setTheme(LayoutDto.ThemeDto.builder().mode("theme9").build());

        ApiException exception = assertThrows(ApiException.class, () -> service.saveMyLayout("admin", request));

        assertEquals("INVALID_LAYOUT", exception.getCode());
    }

    private UserAccount user(Long id, String username) {
        return UserAccount.builder()
                .id(id)
                .username(username)
                .enabled(true)
                .accountStatus("active")
                .employmentStatus("employed")
                .build();
    }

    private Layout layout(Long id, Long userId) throws Exception {
        return Layout.builder()
                .id(id)
                .userId(userId)
                .tabName("dashboard")
                .personalData("""
                        {
                          "version": 1,
                          "theme": { "mode": "theme3" },
                          "layout": {
                            "activeTab": "tab-1",
                            "tabs": %s
                          }
                        }
                        """.formatted(tabs().toString()))
                .build();
    }

    private LayoutDto dto(Long userId) throws Exception {
        return LayoutDto.builder()
                .userId(userId)
                .theme(LayoutDto.ThemeDto.builder().mode("theme3").build())
                .activeTab("tab-1")
                .tabs(tabs())
                .build();
    }

    private JsonNode tabs() throws Exception {
        return MAPPER.readTree("""
                [
                  {
                    "id": "tab-1",
                    "name": "Line A",
                    "activeSubTab": "subtab-1",
                    "subTabs": [
                      {
                        "id": "subtab-1",
                        "name": "Equipment 1",
                        "gridConfig": { "rows": 2, "cols": 2, "layout": "grid", "gapSize": 8 },
                        "cameraPositions": []
                      }
                    ]
                  }
                ]
                """);
    }
}
