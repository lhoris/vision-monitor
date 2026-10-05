package com.vision.dto;

import java.util.List;
import java.util.Map;

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
            Integer refreshIntervalSec,
            String defaultText,
            Map<String, Object> mapping
    ) { }
}
