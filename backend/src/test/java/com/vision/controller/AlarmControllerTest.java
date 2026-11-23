package com.vision.controller;

import com.vision.config.AuthSessionInterceptor;
import com.vision.dto.AuthenticatedUserDto;
import com.vision.entity.AlarmLog;
import com.vision.entity.AlarmRule;
import com.vision.repository.AlarmLogRepository;
import com.vision.repository.AlarmRuleRepository;
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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.eq;
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

    @Test
    void restoresIndividualAlarmToUnacknowledged() throws Exception {
        AlarmLogRepository alarmLogs = mock(AlarmLogRepository.class);
        AlarmRuleRepository rules = mock(AlarmRuleRepository.class);
        AlarmLog alarm = AlarmLog.builder().id(21L).alarmType("SIGNUP_REQUEST").severity("warning")
                .message("가입 신청").occurredTimestamp(java.time.LocalDateTime.now()).targetUserId(7L)
                .acknowledgedStatus("Y").build();
        when(alarmLogs.findByIdAndTargetUserIdAndDataEndStatus(21L, 7L, "N")).thenReturn(java.util.Optional.of(alarm));
        AlarmController controller = new AlarmController(broker, publisher, alarmLogs, "model-secret", rules);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(new GlobalExceptionHandler()).build();

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/alarms/21/unacknowledge")
                        .requestAttr(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE,
                                new AuthenticatedUserDto(7L, "admin", "admin", List.of("admin:access"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.acknowledged").value(false));

        org.junit.jupiter.api.Assertions.assertEquals("N", alarm.getAcknowledgedStatus());
        org.junit.jupiter.api.Assertions.assertNull(alarm.getAcknowledgedTimestamp());
        verify(alarmLogs).saveAll(anyList());
    }

    @Test
    void restoresAllActiveLogsForSharedAcknowledgement() throws Exception {
        AlarmLogRepository alarmLogs = mock(AlarmLogRepository.class);
        AlarmRuleRepository rules = mock(AlarmRuleRepository.class);
        AlarmRule rule = new AlarmRule();
        rule.setCode("SIGNUP_REQUEST");
        rule.setAcknowledgementScope("GROUP");
        AlarmLog selected = AlarmLog.builder().id(22L).alarmType("SIGNUP_REQUEST").alarmGroupId("group-1")
                .severity("warning").message("가입 신청").occurredTimestamp(java.time.LocalDateTime.now()).targetUserId(7L)
                .acknowledgedStatus("Y").build();
        AlarmLog sibling = AlarmLog.builder().id(23L).alarmType("SIGNUP_REQUEST").alarmGroupId("group-1")
                .severity("warning").message("가입 신청").occurredTimestamp(java.time.LocalDateTime.now()).targetUserId(8L)
                .acknowledgedStatus("Y").build();
        when(alarmLogs.findByIdAndTargetUserIdAndDataEndStatus(22L, 7L, "N")).thenReturn(java.util.Optional.of(selected));
        when(rules.findByCodeIgnoreCaseAndDataEndStatus("SIGNUP_REQUEST", "N")).thenReturn(java.util.Optional.of(rule));
        when(alarmLogs.findAllByAlarmGroupIdAndDataEndStatus("group-1", "N")).thenReturn(List.of(selected, sibling));
        AlarmController controller = new AlarmController(broker, publisher, alarmLogs, "model-secret", rules);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(new GlobalExceptionHandler()).build();

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/alarms/22/unacknowledge")
                        .requestAttr(AuthSessionInterceptor.AUTHENTICATED_USER_ATTRIBUTE,
                                new AuthenticatedUserDto(7L, "admin", "admin", List.of("admin:access"))))
                .andExpect(status().isOk());

        org.junit.jupiter.api.Assertions.assertEquals("N", selected.getAcknowledgedStatus());
        org.junit.jupiter.api.Assertions.assertEquals("N", sibling.getAcknowledgedStatus());
        verify(alarmLogs).saveAll(eq(List.of(selected, sibling)));
    }
}
