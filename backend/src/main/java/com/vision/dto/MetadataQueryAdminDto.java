package com.vision.dto;

import java.time.LocalDateTime;

public record MetadataQueryAdminDto(
        Long id,
        String queryCode,
        String queryName,
        String queryDescription,
        String sqlText,
        String parameterSchema,
        String resultSchema,
        Integer queryTimeoutSec,
        boolean enabled,
        boolean deleted,
        long referenceCount,
        LocalDateTime updatedAt
) {}
