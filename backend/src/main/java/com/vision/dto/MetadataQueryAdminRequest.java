package com.vision.dto;

public record MetadataQueryAdminRequest(
        String queryCode,
        String queryName,
        String queryDescription,
        String sqlText,
        String parameterSchema,
        String resultSchema,
        Integer queryTimeoutSec,
        String useStatus
) {}
