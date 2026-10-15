package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.sse.AlarmSseBroker;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AlarmStreamControllerTest {
    private final AlarmSseBroker broker = new AlarmSseBroker(60_000L);
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new AlarmStreamController(broker))
            .build();

    @AfterEach
    void tearDown() {
        broker.shutdown();
    }

    @Test
    void opensStreamForAuthenticatedUserAttribute() throws Exception {
        mockMvc.perform(get("/api/alarms/stream")
                        .requestAttr(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE,
                                new AuthenticatedUserDto(1L, "alice", "user", java.util.List.of())))
                .andExpect(status().isOk());
    }
}
