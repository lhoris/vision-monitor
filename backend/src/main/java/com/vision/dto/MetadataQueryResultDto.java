package com.vision.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record MetadataQueryResultDto(
        String queryCode,
        List<Map<String, Object>> schema,
        List<Map<String, Object>> rows,
        Instant fetchedAt
) { }
