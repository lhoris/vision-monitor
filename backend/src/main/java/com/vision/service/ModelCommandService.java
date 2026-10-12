package com.vision.service;

import com.vision.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.List;
import java.util.Map;

/** Registers administrator requests in the database queue consumed directly by the VM Agent. */
@Service
@RequiredArgsConstructor
public class ModelCommandService {
    private final NamedParameterJdbcTemplate jdbc;

    @Transactional
    public void request(Long processId, String action, String requestedBy) {
        String commandType = normalizeCommandType(action);
        List<Map<String, Object>> processes = jdbc.queryForList("""
                SELECT MODEL_PROCESS_ID, SERVER_IP
                FROM TB_M26_MODEL_PROCESS
                WHERE MODEL_PROCESS_ID = :id AND DATA_END_STATUS = 'N'
                FOR UPDATE
                """, Map.of("id", processId));
        if (processes.isEmpty()) throw new ApiException("MODEL_NOT_FOUND", "The model process was not found");

        String serverIp = String.valueOf(processes.get(0).get("SERVER_IP"));
        Integer active = jdbc.queryForObject("""
                SELECT COUNT(*) FROM TB_M26_MODEL_COMMAND
                WHERE MODEL_PROCESS_ID = :processId AND DATA_END_STATUS = 'N'
                  AND COMMAND_STATUS IN ('REQUESTED', 'PROCESSING')
                """, Map.of("processId", processId), Integer.class);
        if (active != null && active > 0) {
            throw new ApiException("ACTION_BLOCKED", "An unprocessed model process command already exists");
        }

        jdbc.update("""
                INSERT INTO TB_M26_MODEL_COMMAND (
                    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
                    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
                    MODEL_PROCESS_ID, TARGET_SERVER_IP, COMMAND_TYPE, COMMAND_STATUS, REQUESTED_BY
                ) VALUES ('U', 'API', 'MODEL_COMMAND', 'U', 'API', 'MODEL_COMMAND',
                    :processId, :serverIp, :commandType, 'REQUESTED', :requestedBy)
                """, new MapSqlParameterSource()
                .addValue("processId", processId)
                .addValue("serverIp", serverIp)
                .addValue("commandType", commandType)
                .addValue("requestedBy", requestedBy == null || requestedBy.isBlank() ? "SYSTEM" : requestedBy));
    }

    private String normalizeCommandType(String action) {
        String value = action == null ? "" : action.trim().toUpperCase(Locale.ROOT);
        if (!value.matches("[A-Z0-9][A-Z0-9_-]{0,19}")) {
            throw new ApiException("VALIDATION_ERROR", "Invalid model command type");
        }
        return value;
    }
}
