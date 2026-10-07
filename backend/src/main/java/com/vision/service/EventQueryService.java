package com.vision.service;

import com.vision.dto.EventPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventQueryService {
    private final NamedParameterJdbcTemplate jdbc;

    @Transactional(readOnly = true)
    public EventPageResponse list(int page, int pageSize) {
        int safePage = Math.max(page, 0);
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("limit", safePageSize)
                .addValue("offset", safePage * safePageSize);

        List<Map<String, Object>> content = jdbc.query("""
                SELECT EVENT_ID, CAMERA_ID, EVENT_TYPE, SEVERITY, DESCRIPTION,
                       OCCURRED_TIMESTAMP, ACKNOWLEDGED_STATUS
                FROM TB_M26_EVENT_HISTORY
                WHERE DATA_END_STATUS = 'N'
                ORDER BY OCCURRED_TIMESTAMP DESC, EVENT_ID DESC
                LIMIT :limit OFFSET :offset
                """, params, (rs, rowNum) -> toEvent(rs));
        Long total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM TB_M26_EVENT_HISTORY WHERE DATA_END_STATUS = 'N'",
                Map.of(), Long.class);
        long totalElements = total == null ? 0 : total;
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / safePageSize);
        return new EventPageResponse(content, totalElements, totalPages, safePage, safePageSize);
    }

    private Map<String, Object> toEvent(java.sql.ResultSet rs) throws java.sql.SQLException {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("id", rs.getLong("EVENT_ID"));
        event.put("cameraId", rs.getLong("CAMERA_ID"));
        event.put("type", rs.getString("EVENT_TYPE"));
        event.put("severity", rs.getString("SEVERITY").toLowerCase());
        event.put("description", rs.getString("DESCRIPTION"));
        Timestamp occurredAt = rs.getTimestamp("OCCURRED_TIMESTAMP");
        event.put("timestamp", occurredAt == null ? null : occurredAt.toInstant().toString());
        event.put("acknowledged", "Y".equalsIgnoreCase(rs.getString("ACKNOWLEDGED_STATUS")));
        event.put("metadata", Map.of());
        return event;
    }
}
