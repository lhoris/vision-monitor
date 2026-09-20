package com.vision.dto;

import java.util.List;
import java.util.Map;

public record MetadataQuerySummaryDto(
        Long id,
        String queryCode,
        String queryName,
        String description,
        List<Map<String, Object>> resultSchema,
        boolean enabled
) { }
