package com.vision.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MetadataProfileService {
    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Map<String, Object> get(Long sourceId) {
        Map<String, Object> profile = jdbc.query("""
                SELECT METADATA_PROFILE_ID, VIDEO_SOURCE_ID, PROFILE_NAME
                FROM TB_M26_VIDEO_METADATA_PROFILE
                WHERE VIDEO_SOURCE_ID = :sourceId AND USE_STATUS = 'Y' AND DATA_END_STATUS = 'N'
                ORDER BY DEFAULT_STATUS DESC, METADATA_PROFILE_ID
                LIMIT 1
                """, Map.of("sourceId", sourceId), rows -> {
            if (!rows.next()) throw new ApiException("METADATA_PROFILE_NOT_FOUND", "Metadata profile was not found");
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("profileId", rows.getLong("METADATA_PROFILE_ID"));
            result.put("sourceId", String.valueOf(rows.getLong("VIDEO_SOURCE_ID")));
            result.put("profileName", rows.getString("PROFILE_NAME"));
            return result;
        });
        List<Map<String, Object>> sections = jdbc.query("""
                SELECT s.METADATA_SECTION_ID, s.SECTION_CODE, s.SECTION_TITLE, s.SECTION_TYPE,
                       s.TEXT_DISPLAY_MODE,
                       s.SORT_ORDER, s.VISIBLE_STATUS, q.QUERY_CODE, s.REFRESH_INTERVAL_SEC,
                       s.DEFAULT_TEXT, s.SECTION_OPTIONS
                FROM TB_M26_VIDEO_METADATA_SECTION s
                LEFT JOIN TB_M26_METADATA_QUERY q ON q.METADATA_QUERY_ID = s.METADATA_QUERY_ID
                WHERE s.METADATA_PROFILE_ID = :profileId AND s.DATA_END_STATUS = 'N'
                ORDER BY s.SORT_ORDER, s.METADATA_SECTION_ID
                """, Map.of("profileId", profile.get("profileId")), (rs, rowNum) -> {
            Map<String, Object> section = new LinkedHashMap<>();
            section.put("id", rs.getString("SECTION_CODE"));
            section.put("title", rs.getString("SECTION_TITLE"));
            section.put("type", rs.getString("SECTION_TYPE").toLowerCase());
            section.put("textDisplayMode", "LABEL_VALUE".equalsIgnoreCase(rs.getString("TEXT_DISPLAY_MODE")) ? "label_value" : "free");
            section.put("order", rs.getInt("SORT_ORDER"));
            section.put("visible", "Y".equalsIgnoreCase(rs.getString("VISIBLE_STATUS")));
            section.put("queryId", rs.getString("QUERY_CODE"));
            section.put("refreshIntervalSec", rs.getInt("REFRESH_INTERVAL_SEC"));
            section.put("defaultText", rs.getString("DEFAULT_TEXT"));
            section.put("sourceProfileStatus", "included");
            section.put("mapping", parseOptions(rs.getString("SECTION_OPTIONS")));
            return section;
        });
        profile.put("sections", sections);
        profile.put("updatedAt", java.time.Instant.now().toString());
        return profile;
    }

    private Object parseOptions(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try { return objectMapper.readValue(json, Object.class); }
        catch (Exception error) { return Map.of(); }
    }
}
