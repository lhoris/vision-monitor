package com.vision.dto;

public record ModelProcessCreateRequest(
        String processId,
        String modelName,
        String automationName,
        String serverIp,
        String pythonProjectPath
) {
}
