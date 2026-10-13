package com.vision.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/** SQL access for model-process management. Keeps persistence details out of the service layer. */
@Repository
@RequiredArgsConstructor
public class ModelProcessQueryRepository {
    private static final String PROCESS_COLUMNS = """
            p.MODEL_PROCESS_ID, p.PROCESS_AREA_CODE,
            COALESCE(d.CODE_VALUE_NAME_KO, d.CODE_VALUE_NAME) PROCESS_NAME,
            p.MODEL_NAME, p.AUTOMATION_NAME, p.SERVER_IP, p.PYTHON_PROJECT_PATH,
            p.PROCESS_STATUS, p.MONITORING_STATUS, p.CONTROL_STATUS,
            p.LAST_STATUS_TIMESTAMP, p.DESCRIPTION,
            (SELECT CASE mc.COMMAND_STATUS
                      WHEN 'PENDING' THEN 'REQUESTED'
                      WHEN 'COMPLETED' THEN 'SUCCEEDED'
                      ELSE mc.COMMAND_STATUS
                    END
               FROM TB_M26_MODEL_COMMAND mc
              WHERE mc.MODEL_PROCESS_ID = CAST(p.MODEL_PROCESS_ID AS CHAR)
                AND mc.DATA_END_STATUS = 'N'
              ORDER BY mc.CREATED_TIMESTAMP DESC LIMIT 1) CONTROL_REQUEST_STATUS
            """;

    private static final String PROCESS_JOINS = """
            FROM TB_M26_MODEL_PROCESS p
            LEFT JOIN TB_M26_CODE c
              ON UPPER(c.CODE_NAME) = 'PROCESS_AREA'
             AND c.DATA_END_STATUS = 'N'
            LEFT JOIN TB_M26_CODE_DETAIL d
              ON d.CODE_ID = c.CODE_ID
             AND d.CODE_VALUE = p.PROCESS_AREA_CODE
             AND d.DATA_END_STATUS = 'N'
            """;

    private final NamedParameterJdbcTemplate jdbc;

    public List<Map<String, Object>> findProcessAreas() {
        return jdbc.queryForList("""
                SELECT d.CODE_VALUE, COALESCE(d.CODE_VALUE_NAME_KO, d.CODE_VALUE_NAME) DISPLAY_NAME, d.SORT_ORDER
                  FROM TB_M26_CODE c
                  JOIN TB_M26_CODE_DETAIL d ON d.CODE_ID = c.CODE_ID
                 WHERE UPPER(c.CODE_NAME) = 'PROCESS_AREA'
                   AND c.DATA_END_STATUS = 'N'
                   AND d.DATA_END_STATUS = 'N'
                 ORDER BY d.SORT_ORDER, d.CODE_DETAIL_ID
                """, Map.of());
    }

    public List<Map<String, Object>> findProcesses(List<String> areas) {
        MapSqlParameterSource params = new MapSqlParameterSource();
        String filter = "";
        if (areas != null && !areas.isEmpty()) {
            params.addValue("areas", areas);
            filter = " AND p.PROCESS_AREA_CODE IN (:areas)";
        }
        return jdbc.queryForList(("SELECT " + PROCESS_COLUMNS + PROCESS_JOINS
                + " WHERE p.DATA_END_STATUS = 'N'" + filter
                + " ORDER BY p.PROCESS_AREA_CODE, p.MODEL_PROCESS_ID"), params);
    }

    public void insertProcess(String processId, String modelName, String automationName, String serverIp, String path) {
        jdbc.update("""
                INSERT INTO TB_M26_MODEL_PROCESS (
                    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
                    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
                    PROCESS_AREA_CODE, MODEL_NAME, AUTOMATION_NAME, SERVER_IP, PYTHON_PROJECT_PATH
                ) VALUES ('U', 'API', 'MODEL_CREATE', 'U', 'API', 'MODEL_CREATE',
                    :processId, :modelName, :automationName, :serverIp, :pythonProjectPath)
                """, new MapSqlParameterSource()
                .addValue("processId", processId)
                .addValue("modelName", modelName)
                .addValue("automationName", automationName)
                .addValue("serverIp", serverIp)
                .addValue("pythonProjectPath", path));
    }

    public int updateSettings(Long id, String serverIp, String path) {
        return jdbc.update("""
                UPDATE TB_M26_MODEL_PROCESS
                   SET SERVER_IP = :serverIp, PYTHON_PROJECT_PATH = :path
                 WHERE MODEL_PROCESS_ID = :id
                   AND DATA_END_STATUS = 'N'
                """, new MapSqlParameterSource()
                .addValue("serverIp", serverIp)
                .addValue("path", path)
                .addValue("id", id));
    }

    public List<Map<String, Object>> findEventLogs(Long id) {
        return jdbc.queryForList("""
                SELECT MODEL_EVENT_LOG_ID, OCCURRED_TIMESTAMP, SEVERITY, MESSAGE, DETECTION_SUMMARY
                  FROM TB_M26_MODEL_EVENT_LOG
                 WHERE MODEL_PROCESS_ID = :id
                   AND DATA_END_STATUS = 'N'
                 ORDER BY OCCURRED_TIMESTAMP DESC, MODEL_EVENT_LOG_ID DESC
                """, Map.of("id", id));
    }

    public Map<String, Object> findProcess(Long id) {
        return jdbc.queryForMap(("SELECT " + PROCESS_COLUMNS + PROCESS_JOINS
                + " WHERE p.MODEL_PROCESS_ID = :id AND p.DATA_END_STATUS = 'N'"), Map.of("id", id));
    }

    public Map<String, Object> findLatestProcess(String area, String modelName) {
        return jdbc.queryForMap(("SELECT " + PROCESS_COLUMNS + PROCESS_JOINS
                + " WHERE p.PROCESS_AREA_CODE = :area AND p.MODEL_NAME = :name"
                + " ORDER BY p.MODEL_PROCESS_ID DESC LIMIT 1"),
                Map.of("area", area, "name", modelName));
    }
}
