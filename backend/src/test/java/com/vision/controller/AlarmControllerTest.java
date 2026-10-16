package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.sse.AlarmEventPublisher;
import com.vision.sse.AlarmSseBroker;
import com.vision.util.ApiResponse;
import com.vision.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AlarmControllerTest {
    private final AlarmSseBroker broker = new AlarmSseBroker(60_000L);
    private final AlarmEventPublisher publisher = mock(AlarmEventPublisher.class);
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new AlarmController(broker, publisher, "model-secret"))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @AfterEach
    void tearDown() {
        broker.shutdown();
    }

    @Test
    void opensStreamForAuthenticatedUserAttribute() throws Exception {
        mockMvc.perform(get("/api/alarms/stream")
                        .requestAttr(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE,
                                new AuthenticatedUserDto(1L, "alice", "user", List.of())))
                .andExpect(status().isOk());
    }

    @Test
    void acceptsModelAlarmWithServiceKeyAndPublishesToAll() throws Exception {
        mockMvc.perform(post("/api/alarms/events")
                        .header("X-Model-Server-Key", "model-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"source":"MODEL_SERVER","type":"PERSON_DETECTED","severity":"warning","modelProcessId":12,"description":"Restricted area detected","occurredAt":"2026-10-16T12:00:00Z","metadata":{"zone":"A-01"}}
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accepted").value(true));

        verify(publisher).publishToAll(any());
    }

    @Test
    void rejectsModelAlarmWithoutValidServiceKey() throws Exception {
        mockMvc.perform(post("/api/alarms/events")
                        .header("X-Model-Server-Key", "wrong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"source\":\"MODEL_SERVER\",\"type\":\"WARNING\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }
}
