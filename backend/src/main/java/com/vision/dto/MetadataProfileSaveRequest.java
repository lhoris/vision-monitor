package com.vision.dto;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

public record MetadataProfileSaveRequest(
        List<MetadataSectionRequest> sections
) {
    public record MetadataSectionRequest(
            String id,
            String title,
            String type,
            String textDisplayMode,
            Integer order,
            Boolean visible,
            String queryId,
            BigDecimal refreshIntervalSec,
            String defaultText,
            Map<String, Object> mapping
    ) { }
}
