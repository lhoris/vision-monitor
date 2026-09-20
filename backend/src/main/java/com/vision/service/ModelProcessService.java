package com.vision.service;

import com.vision.dto.ModelProcessCreateRequest;
import com.vision.dto.ModelProcessSettingsRequest;
import com.vision.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ModelProcessService {
    private final NamedParameterJdbcTemplate jdbc;

    @Transactional(readOnly = true)
    public Map<String, Object> list(String processAreas) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("processAreas", listProcessAreas());
        MapSqlParameterSource params = new MapSqlParameterSource();
        String areaFilter = "";
        if (processAreas != null && !processAreas.isBlank()) {
            String[] areas = processAreas.split(",");
            params.addValue("areas", Arrays.stream(areas).map(String::trim).filter(value -> !value.isBlank()).map(String::toUpperCase).toList());
            areaFilter = " AND p.PROCESS_AREA_CODE IN (:areas)";
        }
        result.put("processes", jdbc.query("""
                SELECT p.MODEL_PROCESS_ID, p.PROCESS_AREA_CODE, COALESCE(d.CODE_VALUE_NAME_KO, d.CODE_VALUE_NAME) PROCESS_NAME,
                       p.MODEL_NAME, p.AUTOMATION_NAME, p.SERVER_IP, p.PYTHON_PROJECT_PATH,
                       p.PROCESS_STATUS, p.MONITORING_STATUS, p.CONTROL_STATUS,
                       p.LAST_STATUS_TIMESTAMP, p.DESCRIPTION
                FROM TB_M26_MODEL_PROCESS p
                LEFT JOIN TB_M26_CODE c ON UPPER(c.CODE_NAME) = 'PROCESS_AREA' AND c.DATA_END_STATUS = 'N'
                LEFT JOIN TB_M26_CODE_DETAIL d ON d.CODE_ID = c.CODE_ID AND d.CODE_VALUE = p.PROCESS_AREA_CODE AND d.DATA_END_STATUS = 'N'
                WHERE p.DATA_END_STATUS = 'N' %s
                ORDER BY p.PROCESS_AREA_CODE, p.MODEL_PROCESS_ID
                """.formatted(areaFilter), params, (rs, rowNum) -> toProcess(rs)));
        return result;
    }

    private List<Map<String, Object>> listProcessAreas() {
        List<Map<String, Object>> areas = jdbc.query("""
                SELECT d.CODE_VALUE, COALESCE(d.CODE_VALUE_NAME_KO, d.CODE_VALUE_NAME) DISPLAY_NAME, d.SORT_ORDER
                FROM TB_M26_CODE c
                JOIN TB_M26_CODE_DETAIL d ON d.CODE_ID = c.CODE_ID
                WHERE UPPER(c.CODE_NAME) = 'PROCESS_AREA' AND c.DATA_END_STATUS = 'N' AND d.DATA_END_STATUS = 'N'
                ORDER BY d.SORT_ORDER, d.CODE_DETAIL_ID
                """, (rs, rowNum) -> {
            Map<String, Object> area = new LinkedHashMap<>();
            area.put("id", rs.getString("CODE_VALUE").toLowerCase());
            area.put("name", rs.getString("DISPLAY_NAME"));
            area.put("sortOrder", rs.getInt("SORT_ORDER"));
            area.put("isAll", false);
            return area;
        });
        Map<String, Object> all = new LinkedHashMap<>();
        all.put("id", "all"); all.put("name", "ALL"); all.put("sortOrder", 0); all.put("isAll", true);
        areas.add(0, all);
        return areas;
    }

    @Transactional
    public Map<String, Object> create(ModelProcessCreateRequest request) {
        validate(request.processId(), request.modelName(), request.automationName(), request.serverIp(), request.pythonProjectPath());
        jdbc.update("""
                INSERT INTO TB_M26_MODEL_PROCESS (CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
                LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
                PROCESS_AREA_CODE, MODEL_NAME, AUTOMATION_NAME, SERVER_IP, PYTHON_PROJECT_PATH)
                VALUES ('U', 'API', 'MODEL_CREATE', 'U', 'API', 'MODEL_CREATE', :processId, :modelName, :automationName, :serverIp, :pythonProjectPath)
                """, new MapSqlParameterSource("processId", request.processId().toUpperCase()).addValue("modelName", request.modelName().trim()).addValue("automationName", request.automationName().trim()).addValue("serverIp", request.serverIp().trim()).addValue("pythonProjectPath", request.pythonProjectPath().trim()));
        return findLatest(request.processId(), request.modelName().trim());
    }

    @Transactional
    public Map<String, Object> updateSettings(Long id, ModelProcessSettingsRequest request) {
        validateIpAndPath(request.serverIp(), request.pythonProjectPath());
        int updated = jdbc.update("UPDATE TB_M26_MODEL_PROCESS SET SERVER_IP = :serverIp, PYTHON_PROJECT_PATH = :path WHERE MODEL_PROCESS_ID = :id AND DATA_END_STATUS = 'N'", new MapSqlParameterSource("serverIp", request.serverIp().trim()).addValue("path", request.pythonProjectPath().trim()).addValue("id", id));
        if (updated == 0) throw new ApiException("MODEL_NOT_FOUND", "Model process was not found");
        return find(id);
    }

    @Transactional
    public Map<String, Object> control(Long id, String action) {
        String status = switch (action.toLowerCase()) { case "start" -> "RUNNING"; case "stop" -> "STOPPED"; case "restart" -> "RUNNING"; default -> throw new ApiException("VALIDATION_ERROR", "Unsupported model action"); };
        int updated = jdbc.update("UPDATE TB_M26_MODEL_PROCESS SET PROCESS_STATUS = :status, LAST_STATUS_TIMESTAMP = CURRENT_TIMESTAMP() WHERE MODEL_PROCESS_ID = :id AND DATA_END_STATUS = 'N'", Map.of("status", status, "id", id));
        if (updated == 0) throw new ApiException("MODEL_NOT_FOUND", "Model process was not found");
        return find(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> logs(Long id) {
        return jdbc.query("SELECT MODEL_EVENT_LOG_ID, OCCURRED_TIMESTAMP, SEVERITY, MESSAGE, DETECTION_SUMMARY FROM TB_M26_MODEL_EVENT_LOG WHERE MODEL_PROCESS_ID = :id AND DATA_END_STATUS = 'N' ORDER BY OCCURRED_TIMESTAMP DESC, MODEL_EVENT_LOG_ID DESC", Map.of("id", id), (rs, rowNum) -> {
            Map<String, Object> log = new LinkedHashMap<>();
            log.put("id", "log-" + rs.getLong("MODEL_EVENT_LOG_ID")); log.put("modelProcessId", String.valueOf(id)); log.put("occurredAt", rs.getTimestamp("OCCURRED_TIMESTAMP").toInstant().toString()); log.put("severity", rs.getString("SEVERITY").toLowerCase()); log.put("message", rs.getString("MESSAGE")); log.put("detectionSummary", rs.getString("DETECTION_SUMMARY")); return log;
        });
    }

    private Map<String, Object> find(Long id) { return jdbc.queryForObject("SELECT p.MODEL_PROCESS_ID, p.PROCESS_AREA_CODE, COALESCE(d.CODE_VALUE_NAME_KO, d.CODE_VALUE_NAME) PROCESS_NAME, p.MODEL_NAME, p.AUTOMATION_NAME, p.SERVER_IP, p.PYTHON_PROJECT_PATH, p.PROCESS_STATUS, p.MONITORING_STATUS, p.CONTROL_STATUS, p.LAST_STATUS_TIMESTAMP, p.DESCRIPTION FROM TB_M26_MODEL_PROCESS p LEFT JOIN TB_M26_CODE c ON UPPER(c.CODE_NAME) = 'PROCESS_AREA' LEFT JOIN TB_M26_CODE_DETAIL d ON d.CODE_ID = c.CODE_ID AND d.CODE_VALUE = p.PROCESS_AREA_CODE WHERE p.MODEL_PROCESS_ID = :id AND p.DATA_END_STATUS = 'N'", Map.of("id", id), (rs, rowNum) -> toProcess(rs)); }
    private Map<String, Object> findLatest(String area, String modelName) { return jdbc.queryForObject("SELECT p.MODEL_PROCESS_ID, p.PROCESS_AREA_CODE, COALESCE(d.CODE_VALUE_NAME_KO, d.CODE_VALUE_NAME) PROCESS_NAME, p.MODEL_NAME, p.AUTOMATION_NAME, p.SERVER_IP, p.PYTHON_PROJECT_PATH, p.PROCESS_STATUS, p.MONITORING_STATUS, p.CONTROL_STATUS, p.LAST_STATUS_TIMESTAMP, p.DESCRIPTION FROM TB_M26_MODEL_PROCESS p LEFT JOIN TB_M26_CODE c ON UPPER(c.CODE_NAME) = 'PROCESS_AREA' LEFT JOIN TB_M26_CODE_DETAIL d ON d.CODE_ID = c.CODE_ID AND d.CODE_VALUE = p.PROCESS_AREA_CODE WHERE p.PROCESS_AREA_CODE = :area AND p.MODEL_NAME = :name ORDER BY p.MODEL_PROCESS_ID DESC LIMIT 1", Map.of("area", area.toUpperCase(), "name", modelName), (rs, rowNum) -> toProcess(rs)); }
    private Map<String, Object> toProcess(java.sql.ResultSet rs) throws java.sql.SQLException { Map<String, Object> item = new LinkedHashMap<>(); item.put("id", String.valueOf(rs.getLong("MODEL_PROCESS_ID"))); item.put("processId", rs.getString("PROCESS_AREA_CODE").toLowerCase()); item.put("processName", rs.getString("PROCESS_NAME") == null ? rs.getString("PROCESS_AREA_CODE") : rs.getString("PROCESS_NAME")); item.put("modelName", rs.getString("MODEL_NAME")); item.put("automationName", rs.getString("AUTOMATION_NAME")); item.put("serverIp", rs.getString("SERVER_IP")); item.put("pythonProjectPath", rs.getString("PYTHON_PROJECT_PATH")); item.put("processStatus", rs.getString("PROCESS_STATUS").toLowerCase()); item.put("monitoringStatus", rs.getString("MONITORING_STATUS").toLowerCase()); item.put("controlStatus", rs.getString("CONTROL_STATUS").toLowerCase()); var timestamp = rs.getTimestamp("LAST_STATUS_TIMESTAMP"); item.put("lastStatusAt", timestamp == null ? null : timestamp.toInstant().toString()); item.put("description", rs.getString("DESCRIPTION")); return item; }
    private void validate(String processId, String modelName, String automationName, String serverIp, String path) { if (processId == null || processId.isBlank() || "all".equalsIgnoreCase(processId) || modelName == null || modelName.isBlank() || automationName == null || automationName.isBlank()) throw new ApiException("VALIDATION_ERROR", "Process area, model name, and automation name are required"); validateIpAndPath(serverIp, path); }
    private void validateIpAndPath(String serverIp, String path) { if (serverIp == null || !serverIp.matches("^((25[0-5]|(2[0-4]|1\\d|[1-9]?\\d)\\.){3}(25[0-5]|(2[0-4]|1\\d|[1-9]?\\d)))$") || path == null || path.isBlank()) throw new ApiException("VALIDATION_ERROR", "A valid server IP and Python project path are required"); }
}
