package com.vision.service;

import com.vision.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModelCommandServiceTest {

    @Mock
    private NamedParameterJdbcTemplate jdbc;

    private ModelCommandService service;

    @BeforeEach
    void setUp() {
        service = new ModelCommandService(jdbc);
    }

    @Test
    void registersRequestedCommandForExistingProcess() {
        when(jdbc.queryForList(anyString(), anyMap())).thenReturn(List.of(
                Map.of("MODEL_PROCESS_ID", 7L, "SERVER_IP", "10.20.4.22")
        ));
        when(jdbc.queryForObject(anyString(), anyMap(), eq(Integer.class))).thenReturn(0);

        service.request(7L, "start", "admin");

        verify(jdbc).update(anyString(), any(SqlParameterSource.class));
    }

    @Test
    void blocksSecondCommandWhilePreviousCommandIsActive() {
        when(jdbc.queryForList(anyString(), anyMap())).thenReturn(List.of(
                Map.of("MODEL_PROCESS_ID", 7L, "SERVER_IP", "10.20.4.22")
        ));
        when(jdbc.queryForObject(anyString(), anyMap(), eq(Integer.class))).thenReturn(1);

        ApiException exception = assertThrows(ApiException.class, () -> service.request(7L, "restart", "admin"));

        assertEquals("ACTION_BLOCKED", exception.getCode());
        verify(jdbc, never()).update(anyString(), any(SqlParameterSource.class));
    }

    @Test
    void rejectsUnknownProcess() {
        when(jdbc.queryForList(anyString(), anyMap())).thenReturn(List.of());

        ApiException exception = assertThrows(ApiException.class, () -> service.request(99L, "stop", "admin"));

        assertEquals("MODEL_NOT_FOUND", exception.getCode());
        verify(jdbc, never()).queryForObject(anyString(), anyMap(), eq(Integer.class));
        verify(jdbc, never()).update(anyString(), any(SqlParameterSource.class));
    }

    @Test
    void rejectsUnsupportedCommandBeforeDatabaseAccess() {
        ApiException exception = assertThrows(ApiException.class, () -> service.request(7L, "pause", "admin"));

        assertEquals("VALIDATION_ERROR", exception.getCode());
        verify(jdbc, never()).queryForList(anyString(), anyMap());
    }
}
