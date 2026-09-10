package com.vision.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.dto.LayoutDto;
import com.vision.exception.ApiException;
import com.vision.exception.GlobalExceptionHandler;
import com.vision.service.LayoutService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class LayoutControllerTest {

    private final LayoutService layoutService = mock(LayoutService.class);
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new LayoutController(layoutService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void returnsCurrentUserLayout() throws Exception {
        when(layoutService.getMyLayout("admin")).thenReturn(layout());

        mockMvc.perform(get("/api/layouts/me")
                        .header("X-Actor-Username", "admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.theme.mode").value("theme3"))
                .andExpect(jsonPath("$.data.activeTab").value("tab-1"))
                .andExpect(jsonPath("$.data.tabs", hasSize(1)));
    }

    @Test
    void returnsAuthRequiredWhenActorMissing() throws Exception {
        when(layoutService.getMyLayout(null)).thenThrow(new ApiException("AUTH_REQUIRED", "Authentication is required"));

        mockMvc.perform(get("/api/layouts/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("AUTH_REQUIRED"));
    }

    @Test
    void savesCurrentUserLayout() throws Exception {
        LayoutDto layout = layout();
        when(layoutService.saveMyLayout(eq("admin"), any(LayoutDto.class))).thenReturn(layout);

        mockMvc.perform(put("/api/layouts/me")
                        .header("X-Actor-Username", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(layout)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.theme.mode").value("theme3"))
                .andExpect(jsonPath("$.data.tabs", hasSize(1)));
    }

    @Test
    void returnsInvalidLayoutFailure() throws Exception {
        when(layoutService.saveMyLayout(eq("admin"), any(LayoutDto.class)))
                .thenThrow(new ApiException("INVALID_LAYOUT", "Layout payload is invalid"));

        mockMvc.perform(put("/api/layouts/me")
                        .header("X-Actor-Username", "admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("INVALID_LAYOUT"));
    }

    private LayoutDto layout() throws Exception {
        return LayoutDto.builder()
                .id(10L)
                .userId(1L)
                .theme(LayoutDto.ThemeDto.builder().mode("theme3").build())
                .activeTab("tab-1")
                .tabs(objectMapper.readTree("""
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
                        """))
                .build();
    }
}
