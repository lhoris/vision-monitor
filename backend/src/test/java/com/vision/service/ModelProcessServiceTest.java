package com.vision.service;

import com.vision.dto.ModelProcessCreateRequest;
import com.vision.entity.ModelCommand;
import com.vision.entity.ModelEventLog;
import com.vision.entity.ModelProcess;
import com.vision.repository.ModelCommandRepository;
import com.vision.repository.ModelEventLogRepository;
import com.vision.repository.ModelProcessRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModelProcessServiceTest {
    @Mock private ModelProcessRepository repository;
    @Mock private ModelCommandRepository commandRepository;
    @Mock private ModelEventLogRepository eventLogRepository;
    @InjectMocks private ModelProcessService service;

    @Test
    void recordsModelRegisteredEventAfterCreate() {
        when(repository.findAgent("agent-1")).thenReturn(Map.of("agentId", "agent-1", "serverIp", "10.20.4.21"));
        when(repository.save(any(ModelProcess.class))).thenAnswer(invocation -> {
            ModelProcess process = invocation.getArgument(0);
            process.setId(101L);
            return process;
        });
        when(repository.findLatestProcess("HEATING", "Heating model")).thenReturn(processRow());

        service.create(new ModelProcessCreateRequest("heating", "Heating model", "Heating automation", "agent-1", "C:\\models\\heating"), "operator");

        ArgumentCaptor<ModelEventLog> captor = ArgumentCaptor.forClass(ModelEventLog.class);
        verify(eventLogRepository).save(captor.capture());
        assertEquals(101L, captor.getValue().getModelProcessId());
        assertEquals("MODEL_REGISTERED", captor.getValue().getEventType());
        assertEquals("operator", captor.getValue().getCreatedObjectId());
    }

    @Test
    void recordsControlRequestedEventWithCommandId() {
        ModelProcess process = new ModelProcess();
        process.setId(101L);
        process.setAgentId("agent-1");
        when(repository.findByIdAndDataEndStatus(101L, "N")).thenReturn(Optional.of(process));
        when(commandRepository.countByAgentIdAndModelProcessIdAndDataEndStatusAndCommandStatusIn("agent-1", "101", "N", List.of("PENDING", "PROCESSING"))).thenReturn(0L);
        when(commandRepository.save(any(ModelCommand.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(repository.findProcess(101L)).thenReturn(processRow());

        service.control(101L, "start", "operator");

        ArgumentCaptor<ModelEventLog> captor = ArgumentCaptor.forClass(ModelEventLog.class);
        verify(eventLogRepository).save(captor.capture());
        assertEquals("CONTROL_REQUESTED", captor.getValue().getEventType());
        org.junit.jupiter.api.Assertions.assertTrue(captor.getValue().getDetectionSummary().startsWith("commandId="));
    }

    private Map<String, Object> processRow() {
        Map<String, Object> row = new HashMap<>();
        row.put("modelProcessId", 101L);
        row.put("processAreaCode", "HEATING");
        row.put("processName", "가열");
        row.put("modelName", "Heating model");
        row.put("automationName", "Heating automation");
        row.put("serverIp", "10.20.4.21");
        row.put("agentId", "agent-1");
        row.put("pythonProjectPath", "C:\\models\\heating");
        row.put("processStatus", "UNKNOWN");
        row.put("monitoringStatus", "UNKNOWN");
        row.put("controlStatus", "UNKNOWN");
        return row;
    }
}
