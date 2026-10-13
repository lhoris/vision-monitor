package com.vision.service;

import com.vision.entity.ModelCommand;
import com.vision.entity.ModelProcess;
import com.vision.exception.ApiException;
import com.vision.repository.ModelCommandRepository;
import com.vision.repository.ModelProcessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** Registers administrator requests in the database queue consumed directly by the VM Agent. */
@Service
@RequiredArgsConstructor
public class ModelCommandService {
    private final ModelProcessRepository processRepository;
    private final ModelCommandRepository commandRepository;

    @Transactional
    public void request(Long processId, String action, String requestedBy) {
        String commandType = normalizeCommandType(action);
        ModelProcess process = processRepository.findActiveForUpdate(processId)
                .orElseThrow(() -> new ApiException("MODEL_NOT_FOUND", "The model process was not found"));

        String agentId = process.getAgentId();
        if (agentId == null || agentId.isBlank()) {
            throw new ApiException("AGENT_NOT_FOUND", "No Agent is assigned to the model process");
        }

        long activeCount = commandRepository.countByAgentIdAndModelProcessIdAndDataEndStatusAndCommandStatusIn(
                agentId,
                String.valueOf(processId),
                "N",
                List.of("PENDING", "PROCESSING"));
        if (activeCount > 0) {
            throw new ApiException("ACTION_BLOCKED", "An unprocessed model process command already exists");
        }

        ModelCommand command = new ModelCommand();
        command.setCommandId(UUID.randomUUID().toString());
        command.setAgentId(agentId);
        command.setModelProcessId(String.valueOf(processId));
        command.setCommandType(commandType);
        command.setCommandStatus("PENDING");
        command.setCommandParameters("{}");
        commandRepository.save(command);
    }

    private String normalizeCommandType(String action) {
        String value = action == null ? "" : action.trim().toUpperCase(Locale.ROOT);
        if (!value.matches("[A-Z0-9][A-Z0-9_-]{0,19}")) {
            throw new ApiException("VALIDATION_ERROR", "Invalid model command type");
        }
        return value;
    }
}
