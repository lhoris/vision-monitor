package com.vision.controller;

import com.vision.exception.GlobalExceptionHandler;
import com.vision.dto.EventPageResponse;
import com.vision.service.EventQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EventControllerTest {
    private final EventQueryService eventQueryService = mock(EventQueryService.class);
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new EventController(eventQueryService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void returnsEmptyEventPageUntilEventPersistenceIsConnected() throws Exception {
        when(eventQueryService.list(2, 200)).thenReturn(new EventPageResponse(java.util.List.of(), 0, 0, 2, 100));

        mockMvc.perform(get("/api/events").param("page", "2").param("pageSize", "200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isEmpty())
                .andExpect(jsonPath("$.data.totalElements").value(0))
                .andExpect(jsonPath("$.data.currentPage").value(2))
                .andExpect(jsonPath("$.data.pageSize").value(100));
    }
}
