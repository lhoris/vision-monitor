package com.vision.service;

import com.vision.dto.ModelProcessCreateRequest;
import com.vision.dto.ModelProcessSettingsRequest;
import com.vision.exception.ApiException;
import com.vision.repository.ModelProcessQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.time.Duration;
import java.time.Instant;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ModelProcessService {
    private final ModelProcessQueryRepository repository;
    private final ModelCommandService commandService;

    @Value("${vision.model-monitoring.status-timeout-seconds:30}")
    private long monitoringStatusTimeoutSeconds = 30;

    @Transactional(readOnly = true)
    public Map<String, Object> list(String processAreas) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("processAreas", listProcessAreas());
        List<String> areas = processAreas == null ? List.of() : Arrays.stream(processAreas.split(","))
                .map(String::trim).filter(value -> !value.isBlank()).map(String::toUpperCase).toList();
        result.put("processes", repository.findProcesses(areas).stream().map(this::toProcess).toList());
        return result;
    }

    private List<Map<String, Object>> listProcessAreas() {
        List<Map<String, Object>> areas = repository.findProcessAreas();
        List<Map<String, Object>> result = areas.stream().map(row -> {
            Map<String, Object> area = new LinkedHashMap<>();
            area.put("id", String.valueOf(row.get("CODE_VALUE")).toLowerCase());
            area.put("name", row.get("DISPLAY_NAME"));
            area.put("sortOrder", row.get("SORT_ORDER"));
            area.put("isAll", false);
            return area;
        }).toList();
        List<Map<String, Object>> mutableAreas = new java.util.ArrayList<>(result);
        Map<String, Object> all = new LinkedHashMap<>();
        all.put("id", "all"); all.put("name", "ALL"); all.put("sortOrder", 0); all.put("isAll", true);
        mutableAreas.add(0, all);
        return mutableAreas;
    }

    @Transactional
    public Map<String, Object> create(ModelProcessCreateRequest request) {
        validate(request.processId(), request.modelName(), request.automationName(), request.serverIp(), request.pythonProjectPath());
        repository.insertProcess(request.processId().toUpperCase(), request.modelName().trim(), request.automationName().trim(), request.serverIp().trim(), request.pythonProjectPath().trim());
        return findLatest(request.processId(), request.modelName().trim());
    }

    @Transactional
    public Map<String, Object> updateSettings(Long id, ModelProcessSettingsRequest request) {
        validateIpAndPath(request.serverIp(), request.pythonProjectPath());
        int updated = repository.updateSettings(id, request.serverIp().trim(), request.pythonProjectPath().trim());
        if (updated == 0) throw new ApiException("MODEL_NOT_FOUND", "Model process was not found");
        return find(id);
    }

    @Transactional
    public Map<String, Object> control(Long id, String action, String requestedBy) {
        commandService.request(id, action, requestedBy);
        return find(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> logs(Long id) {
        return repository.findEventLogs(id).stream().map(row -> {
            Map<String, Object> log = new LinkedHashMap<>();
            Timestamp occurredAt = (Timestamp) row.get("OCCURRED_TIMESTAMP");
            log.put("id", "log-" + row.get("MODEL_EVENT_LOG_ID"));
            log.put("modelProcessId", String.valueOf(id));
            log.put("occurredAt", occurredAt == null ? null : occurredAt.toInstant().toString());
            log.put("severity", String.valueOf(row.get("SEVERITY")).toLowerCase());
            log.put("message", row.get("MESSAGE"));
            log.put("detectionSummary", row.get("DETECTION_SUMMARY"));
            return log;
        }).toList();
    }

    private Map<String, Object> find(Long id) { return toProcess(repository.findProcess(id)); }
    private Map<String, Object> findLatest(String area, String modelName) { return toProcess(repository.findLatestProcess(area.toUpperCase(), modelName)); }
    private Map<String, Object> toProcess(Map<String, Object> row) {
        String processAreaCode = (String) row.get("PROCESS_AREA_CODE");
        String processName = (String) row.get("PROCESS_NAME");
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", String.valueOf(row.get("MODEL_PROCESS_ID")));
        item.put("processId", lower(processAreaCode, "unknown"));
        item.put("processName", processName == null || processName.isBlank() ? processAreaCode : processName);
        item.put("modelName", row.get("MODEL_NAME"));
        item.put("automationName", row.get("AUTOMATION_NAME"));
        item.put("serverIp", row.get("SERVER_IP"));
        item.put("pythonProjectPath", row.get("PYTHON_PROJECT_PATH"));
        item.put("processStatus", lower((String) row.get("PROCESS_STATUS"), "unknown"));
        item.put("controlStatus", lower((String) row.get("CONTROL_STATUS"), "unknown"));
        item.put("controlRequestStatus", lowerOrNull((String) row.get("CONTROL_REQUEST_STATUS")));
        Timestamp timestamp = (Timestamp) row.get("LAST_STATUS_TIMESTAMP");
        item.put("monitoringStatus", resolveMonitoringStatus((String) row.get("MONITORING_STATUS"), timestamp));
        item.put("lastStatusAt", timestamp == null ? null : timestamp.toInstant().toString());
        item.put("description", row.get("DESCRIPTION"));
        return item;
    }

    private String lower(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.toLowerCase(Locale.ROOT);
    }

    private String lowerOrNull(String value) {
        return value == null || value.isBlank() ? null : value.toLowerCase(Locale.ROOT);
    }

    private String resolveMonitoringStatus(String storedStatus, java.sql.Timestamp lastStatusTimestamp) {
        if (lastStatusTimestamp == null) return "unknown";
        long elapsedSeconds = Math.max(0, Duration.between(lastStatusTimestamp.toInstant(), Instant.now()).getSeconds());
        if (elapsedSeconds > monitoringStatusTimeoutSeconds) return "failed";
        return lower(storedStatus, "unknown");
    }
    private void validate(String processId, String modelName, String automationName, String serverIp, String path) { if (processId == null || processId.isBlank() || "all".equalsIgnoreCase(processId) || modelName == null || modelName.isBlank() || automationName == null || automationName.isBlank()) throw new ApiException("VALIDATION_ERROR", "Process area, model name, and automation name are required"); validateIpAndPath(serverIp, path); }
    private void validateIpAndPath(String serverIp, String path) { if (serverIp == null || !serverIp.matches("^((25[0-5]|(2[0-4]|1\\d|[1-9]?\\d)\\.){3}(25[0-5]|(2[0-4]|1\\d|[1-9]?\\d)))$") || path == null || path.isBlank()) throw new ApiException("VALIDATION_ERROR", "A valid server IP and Python project path are required"); }
}
