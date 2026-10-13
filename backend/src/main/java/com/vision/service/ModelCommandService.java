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
import java.util.UUID;

/** Registers administrator requests in the database queue consumed directly by the VM Agent. */
@Service
@RequiredArgsConstructor
public class ModelCommandService {
    private final NamedParameterJdbcTemplate jdbc;

    @Transactional
    public void request(Long processId, String action, String requestedBy) {
        String commandType = normalizeCommandType(action);
        List<Map<String, Object>> processes = jdbc.queryForList("""
                SELECT p.MODEL_PROCESS_ID, p.SERVER_IP, a.AGENT_ID
                FROM TB_M26_MODEL_PROCESS p
                LEFT JOIN TB_M26_AGENT a
                  ON a.IP_ADDRESS = p.SERVER_IP
                 AND a.DATA_END_STATUS = 'N'
                WHERE p.MODEL_PROCESS_ID = :id AND p.DATA_END_STATUS = 'N'
                FOR UPDATE
                """, Map.of("id", processId));
        if (processes.isEmpty()) throw new ApiException("MODEL_NOT_FOUND", "The model process was not found");

        Map<String, Object> process = processes.get(0);
        String agentId = process.get("AGENT_ID") == null ? null : String.valueOf(process.get("AGENT_ID"));
        if (agentId == null || agentId.isBlank()) {
            throw new ApiException("AGENT_NOT_FOUND", "No registered Agent was found for the model process server");
        }
        Integer active = jdbc.queryForObject("""
                SELECT COUNT(*) FROM TB_M26_MODEL_COMMAND
                WHERE AGENT_ID = :agentId
                  AND MODEL_PROCESS_ID = :processId
                  AND DATA_END_STATUS = 'N'
                  AND COMMAND_STATUS IN ('PENDING', 'PROCESSING')
                """, Map.of("agentId", agentId, "processId", String.valueOf(processId)), Integer.class);
        if (active != null && active > 0) {
            throw new ApiException("ACTION_BLOCKED", "An unprocessed model process command already exists");
        }

        jdbc.update("""
                INSERT INTO TB_M26_MODEL_COMMAND (
                    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
                    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
                    COMMAND_ID, AGENT_ID, MODEL_PROCESS_ID, COMMAND_TYPE, COMMAND_STATUS,
                    COMMAND_PARAMETERS
                ) VALUES ('U', 'API', 'MODEL_COMMAND', 'U', 'API', 'MODEL_COMMAND',
                    :commandId, :agentId, :processId, :commandType, 'PENDING', :parameters)
                """, new MapSqlParameterSource()
                .addValue("commandId", UUID.randomUUID().toString())
                .addValue("agentId", agentId)
                .addValue("processId", String.valueOf(processId))
                .addValue("commandType", commandType)
                .addValue("parameters", "{}"));
    }

    private String normalizeCommandType(String action) {
        String value = action == null ? "" : action.trim().toUpperCase(Locale.ROOT);
        if (!value.matches("[A-Z0-9][A-Z0-9_-]{0,19}")) {
            throw new ApiException("VALIDATION_ERROR", "Invalid model command type");
        }
        return value;
    }
}
