package com.vision.controller;

import com.vision.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EventControllerTest {
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new EventController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void returnsEmptyEventPageUntilEventPersistenceIsConnected() throws Exception {
        mockMvc.perform(get("/api/events").param("page", "2").param("pageSize", "200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isEmpty())
                .andExpect(jsonPath("$.data.totalElements").value(0))
                .andExpect(jsonPath("$.data.currentPage").value(2))
                .andExpect(jsonPath("$.data.pageSize").value(100));
    }
}
