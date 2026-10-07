package com.vision.dto;

import java.util.List;
import java.util.Map;

public record EventPageResponse(
        List<Map<String, Object>> content,
        long totalElements,
        int totalPages,
        int currentPage,
        int pageSize
) {
}
