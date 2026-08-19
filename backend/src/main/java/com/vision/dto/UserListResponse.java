package com.vision.dto;

import java.util.List;
import java.util.Map;

public record UserListResponse(
        List<UserAccountDto> items,
        long total,
        int page,
        int pageSize,
        Map<String, Long> summary,
        List<RoleSummaryDto> roles
) {
}
