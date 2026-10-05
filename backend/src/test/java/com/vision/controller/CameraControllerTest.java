package com.vision.controller;

import com.vision.dto.CameraDto;
import com.vision.exception.GlobalExceptionHandler;
import com.vision.service.CameraQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CameraControllerTest {
    private final CameraQueryService service = mock(CameraQueryService.class);
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new CameraController(service))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void listsCameraProjection() throws Exception {
        when(service.list()).thenReturn(List.of(CameraDto.builder()
                .id(1L).name("Line A").streamUrl("http://example.test/whep")
                .status("online").build()));

        mockMvc.perform(get("/api/cameras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].status").value("online"));
    }
}
