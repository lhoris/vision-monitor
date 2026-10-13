package com.vision.service;

import com.vision.entity.ModelCommand;
import com.vision.entity.ModelProcess;
import com.vision.exception.ApiException;
import com.vision.repository.ModelCommandRepository;
import com.vision.repository.ModelProcessRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModelCommandServiceTest {

    @Mock
    private ModelProcessRepository processRepository;

    @Mock
    private ModelCommandRepository commandRepository;

    private ModelCommandService service;

    @BeforeEach
    void setUp() {
        service = new ModelCommandService(processRepository, commandRepository);
    }

    @Test
    void registersRequestedCommandForExistingProcess() {
        when(processRepository.findActiveForUpdate(7L)).thenReturn(Optional.of(process("agent-1")));
        when(commandRepository.countByAgentIdAndModelProcessIdAndDataEndStatusAndCommandStatusIn(
                eq("agent-1"), eq("7"), eq("N"), any())).thenReturn(0L);

        service.request(7L, "start", "admin");

        verify(commandRepository).save(any(ModelCommand.class));
    }

    @Test
    void blocksSecondCommandWhilePreviousCommandIsActive() {
        when(processRepository.findActiveForUpdate(7L)).thenReturn(Optional.of(process("agent-1")));
        when(commandRepository.countByAgentIdAndModelProcessIdAndDataEndStatusAndCommandStatusIn(
                eq("agent-1"), eq("7"), eq("N"), any())).thenReturn(1L);

        ApiException exception = assertThrows(ApiException.class, () -> service.request(7L, "restart", "admin"));

        assertEquals("ACTION_BLOCKED", exception.getCode());
        verify(commandRepository, never()).save(any(ModelCommand.class));
    }

    @Test
    void rejectsUnknownProcess() {
        when(processRepository.findActiveForUpdate(99L)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> service.request(99L, "stop", "admin"));

        assertEquals("MODEL_NOT_FOUND", exception.getCode());
        verify(commandRepository, never()).save(any(ModelCommand.class));
    }

    @Test
    void acceptsCustomCommandType() {
        when(processRepository.findActiveForUpdate(7L)).thenReturn(Optional.of(process("agent-1")));
        when(commandRepository.countByAgentIdAndModelProcessIdAndDataEndStatusAndCommandStatusIn(
                eq("agent-1"), eq("7"), eq("N"), any())).thenReturn(0L);

        service.request(7L, "custom1", "admin");

        verify(commandRepository).save(any(ModelCommand.class));
    }

    private ModelProcess process(String agentId) {
        ModelProcess process = new ModelProcess();
        process.setAgentId(agentId);
        return process;
    }
}
