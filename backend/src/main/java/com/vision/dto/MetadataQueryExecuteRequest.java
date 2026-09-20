package com.vision.dto;

import java.util.Map;

public record MetadataQueryExecuteRequest(Long sourceId, Map<String, Object> parameters) { }
