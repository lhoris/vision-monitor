package com.vision.service;

import com.vision.dto.ModelProcessCreateRequest;
import com.vision.dto.ModelProcessSettingsRequest;
import com.vision.entity.ModelProcess;
import com.vision.exception.ApiException;
import com.vision.entity.ModelCommand;
import com.vision.entity.ModelEventLog;
import com.vision.repository.ModelCommandRepository;
import com.vision.repository.ModelEventLogRepository;
import com.vision.repository.ModelProcessRepository;
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
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ModelProcessService {
    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)){3}$");

    private final ModelProcessRepository repository;
    private final ModelCommandRepository commandRepository;
    private final ModelEventLogRepository eventLogRepository;

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
            area.put("id", String.valueOf(row.get("codeValue")).toLowerCase());
            area.put("name", row.get("displayName"));
            area.put("sortOrder", row.get("sortOrder"));
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
    public Map<String, Object> create(ModelProcessCreateRequest request, String requestedBy) {
        validate(request.processId(), request.modelName(), request.automationName(), request.agentId(), request.pythonProjectPath());
        Map<String, Object> agent = repository.findAgent(request.agentId().trim());
        if (agent == null) throw new ApiException("AGENT_NOT_FOUND", "선택한 Agent를 찾을 수 없습니다.");
        ModelProcess process = new ModelProcess();
        process.setProcessAreaCode(request.processId().toUpperCase());
        process.setModelName(request.modelName().trim());
        process.setAutomationName(request.automationName().trim());
        process.setAgentId(String.valueOf(agent.get("agentId")));
        process.setServerIp(String.valueOf(agent.get("serverIp")));
        process.setPythonProjectPath(request.pythonProjectPath().trim());
        ModelProcess saved = repository.save(process);
        recordEvent(saved.getId(), "INFO", "MODEL_REGISTERED", "모델 프로세스를 등록했습니다.",
                "modelName=" + saved.getModelName() + ", serverIp=" + saved.getServerIp(), requestedBy);
        return findLatest(request.processId(), request.modelName().trim());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAgents() {
        return repository.findAgents();
    }

    @Transactional
    public Map<String, Object> updateSettings(Long id, ModelProcessSettingsRequest request, String requestedBy) {
        validateIpAndPath(request.serverIp(), request.pythonProjectPath());
        ModelProcess process = repository.findById(id)
                .filter(entity -> !"Y".equalsIgnoreCase(entity.getDataEndStatus()))
                .orElseThrow(() -> new ApiException("MODEL_NOT_FOUND", "Model process was not found"));
        String previousSettings = "serverIp=" + process.getServerIp() + ", pythonProjectPath=" + process.getPythonProjectPath();
        process.setServerIp(request.serverIp().trim());
        process.setPythonProjectPath(request.pythonProjectPath().trim());
        repository.save(process);
        recordEvent(process.getId(), "INFO", "MODEL_SETTINGS_CHANGED", "모델 프로세스 설정을 변경했습니다.",
                previousSettings + " -> serverIp=" + process.getServerIp() + ", pythonProjectPath=" + process.getPythonProjectPath(), requestedBy);
        return find(id);
    }

    @Transactional
    public Map<String, Object> control(Long id, String action, String requestedBy) {
        ModelCommand command = enqueueCommand(id, action);
        recordEvent(id, "INFO", "CONTROL_REQUESTED", "모델 프로세스 제어를 요청했습니다.",
                "commandId=" + command.getCommandId() + ", commandType=" + command.getCommandType(), requestedBy);
        return find(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> logs(Long id) {
        return repository.findEventLogs(id).stream().map(row -> {
            Map<String, Object> log = new LinkedHashMap<>();
            Timestamp occurredAt = (Timestamp) row.get("occurredTimestamp");
            log.put("id", "log-" + row.get("modelEventLogId"));
            log.put("modelProcessId", String.valueOf(id));
            log.put("occurredAt", occurredAt == null ? null : occurredAt.toInstant().toString());
            log.put("severity", String.valueOf(row.get("severity")).toLowerCase());
            log.put("eventType", row.get("eventType"));
            log.put("message", row.get("message"));
            log.put("detectionSummary", row.get("detectionSummary"));
            return log;
        }).toList();
    }

    private Map<String, Object> find(Long id) { return toProcess(repository.findProcess(id)); }
    private Map<String, Object> findLatest(String area, String modelName) { return toProcess(repository.findLatestProcess(area.toUpperCase(), modelName)); }

    private ModelCommand enqueueCommand(Long id, String action) {
        String commandType = action == null ? "" : action.trim().toUpperCase(Locale.ROOT);
        if (!commandType.matches("[A-Z0-9][A-Z0-9_-]{0,19}")) {
            throw new ApiException("VALIDATION_ERROR", "Invalid model command type");
        }
        ModelProcess process = repository.findByIdAndDataEndStatus(id, "N")
                .orElseThrow(() -> new ApiException("MODEL_NOT_FOUND", "The model process was not found"));
        if (process.getAgentId() == null || process.getAgentId().isBlank()) {
            throw new ApiException("AGENT_NOT_FOUND", "No Agent is assigned to the model process");
        }
        if (commandRepository.countByAgentIdAndModelProcessIdAndDataEndStatusAndCommandStatusIn(
                process.getAgentId(), String.valueOf(id), "N", List.of("PENDING", "PROCESSING")) > 0) {
            throw new ApiException("ACTION_BLOCKED", "An unprocessed model process command already exists");
        }
        ModelCommand command = new ModelCommand();
        command.setCommandId(java.util.UUID.randomUUID().toString());
        command.setAgentId(process.getAgentId());
        command.setModelProcessId(String.valueOf(id));
        command.setCommandType(commandType);
        command.setCommandStatus("PENDING");
        command.setCommandParameters("{}");
        return commandRepository.save(command);
    }

    private void recordEvent(Long modelProcessId, String severity, String eventType, String message, String details, String actor) {
        ModelEventLog event = new ModelEventLog();
        event.setModelProcessId(modelProcessId);
        event.setOccurredTimestamp(new Timestamp(System.currentTimeMillis()));
        event.setSeverity(severity);
        event.setEventType(eventType);
        event.setMessage(message);
        event.setDetectionSummary(details);
        if (actor != null && !actor.isBlank()) event.setCreatedObjectId(actor);
        eventLogRepository.save(event);
    }
    private Map<String, Object> toProcess(Map<String, Object> row) {
        String processAreaCode = (String) row.get("processAreaCode");
        String processName = (String) row.get("processName");
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", String.valueOf(row.get("modelProcessId")));
        item.put("processId", lower(processAreaCode, "unknown"));
        item.put("processName", processName == null || processName.isBlank() ? processAreaCode : processName);
        item.put("modelName", row.get("modelName"));
        item.put("automationName", row.get("automationName"));
        item.put("serverIp", row.get("serverIp"));
        item.put("agentId", row.get("agentId"));
        item.put("pythonProjectPath", row.get("pythonProjectPath"));
        item.put("processStatus", lower((String) row.get("processStatus"), "unknown"));
        item.put("controlStatus", lower((String) row.get("controlStatus"), "unknown"));
        item.put("controlRequestStatus", lowerOrNull((String) row.get("controlRequestStatus")));
        Timestamp timestamp = (Timestamp) row.get("lastStatusTimestamp");
        item.put("monitoringStatus", resolveMonitoringStatus((String) row.get("monitoringStatus"), timestamp));
        item.put("lastStatusAt", timestamp == null ? null : timestamp.toInstant().toString());
        item.put("description", row.get("description"));
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
    private void validate(String processId, String modelName, String automationName, String agentId, String path) {
        if (processId == null || processId.isBlank() || "all".equalsIgnoreCase(processId)
                || modelName == null || modelName.isBlank()
                || automationName == null || automationName.isBlank()
                || agentId == null || agentId.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "공정, 모델명, 조업 자동화 기술명, Agent는 필수입니다.");
        }
        if (path == null || path.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Python 프로젝트 경로는 필수입니다.");
        }
    }

    private void validateIpAndPath(String serverIp, String path) {
        String normalizedIp = serverIp == null ? "" : serverIp.trim();
        String normalizedPath = path == null ? "" : path.trim();
        if (!IPV4_PATTERN.matcher(normalizedIp).matches() || normalizedPath.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "A valid server IP and Python project path are required");
        }
    }

}
