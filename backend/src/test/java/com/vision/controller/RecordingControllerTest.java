package com.vision.controller;

import com.vision.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RecordingControllerTest {
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new RecordingController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void returnsStructuredUnavailableResponseUntilMediaStorageIsConfigured() throws Exception {
        mockMvc.perform(get("/api/recordings/events/1/clip")
                        .param("cameraId", "1")
                        .param("from", "2026-10-06T00:00:00Z")
                        .param("to", "2026-10-06T00:00:30Z")
                        .param("beforeSeconds", "10")
                        .param("afterSeconds", "20"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("RECORDING_UNAVAILABLE"));
    }

    @Test
    void rejectsInvalidClipRange() throws Exception {
        mockMvc.perform(get("/api/recordings/events/1/clip")
                        .param("cameraId", "1")
                        .param("from", "2026-10-06T00:00:00Z")
                        .param("to", "2026-10-06T00:00:30Z")
                        .param("beforeSeconds", "-1")
                        .param("afterSeconds", "20"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }
}
