package com.vision.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.dto.MetadataProfileSaveRequest;
import com.vision.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
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

    @Transactional
    public Map<String, Object> save(Long sourceId, MetadataProfileSaveRequest request) {
        Long profileId = jdbc.query("""
                SELECT METADATA_PROFILE_ID
                FROM TB_M26_VIDEO_METADATA_PROFILE
                WHERE VIDEO_SOURCE_ID = :sourceId AND USE_STATUS = 'Y' AND DATA_END_STATUS = 'N'
                ORDER BY DEFAULT_STATUS DESC, METADATA_PROFILE_ID
                LIMIT 1
                """, Map.of("sourceId", sourceId), rows -> {
            return rows.next() ? rows.getLong("METADATA_PROFILE_ID") : null;
        });
        if (profileId == null) {
            jdbc.update("""
                    INSERT INTO TB_M26_VIDEO_METADATA_PROFILE (
                        CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
                        LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
                        VIDEO_SOURCE_ID, PROFILE_NAME, DEFAULT_STATUS, USE_STATUS, DATA_END_STATUS
                    ) VALUES ('U', :objectId, :programId, 'U', :objectId, :programId,
                              :sourceId, :profileName, 'N', 'Y', 'N')
                    """, Map.of("objectId", String.valueOf(sourceId), "programId", "METADATA_PROFILE_API",
                            "sourceId", sourceId, "profileName", "Video Source " + sourceId + " Metadata"));
            profileId = jdbc.queryForObject("""
                    SELECT METADATA_PROFILE_ID FROM TB_M26_VIDEO_METADATA_PROFILE
                    WHERE VIDEO_SOURCE_ID = :sourceId AND USE_STATUS = 'Y' AND DATA_END_STATUS = 'N'
                    ORDER BY METADATA_PROFILE_ID DESC LIMIT 1
                    """, Map.of("sourceId", sourceId), Long.class);
        }

        List<MetadataProfileSaveRequest.MetadataSectionRequest> sections = request == null || request.sections() == null
                ? List.of() : request.sections();
        jdbc.update("""
                UPDATE TB_M26_VIDEO_METADATA_SECTION
                SET DATA_END_STATUS = 'Y', DATA_END_OBJECT_TYPE = 'U', DATA_END_OBJECT_ID = :objectId,
                    DATA_END_PROGRAM_ID = :programId, DATA_END_TIMESTAMP = CURRENT_TIMESTAMP()
                WHERE METADATA_PROFILE_ID = :profileId AND DATA_END_STATUS = 'N'
                """, Map.of("profileId", profileId, "objectId", String.valueOf(sourceId), "programId", "METADATA_PROFILE_API"));

        for (int index = 0; index < sections.size(); index++) {
            MetadataProfileSaveRequest.MetadataSectionRequest section = sections.get(index);
            insertSection(profileId, sourceId, section, index);
        }
        return get(sourceId);
    }

    private void insertSection(Long profileId, Long sourceId,
                               MetadataProfileSaveRequest.MetadataSectionRequest section, int index) {
        if (section == null || section.id() == null || section.id().isBlank()
                || section.title() == null || section.title().isBlank()) {
            throw new ApiException("METADATA_PROFILE_INVALID", "Metadata section id and title are required");
        }
        String type = section.type() == null ? "TEXT" : section.type().toUpperCase(Locale.ROOT);
        if (!List.of("TEXT", "GRID", "CHART").contains(type)) {
            throw new ApiException("METADATA_PROFILE_INVALID", "Unsupported metadata section type");
        }
        int interval = section.refreshIntervalSec() == null ? 10 : section.refreshIntervalSec();
        if (!List.of(5, 10, 30, 60).contains(interval)) {
            throw new ApiException("METADATA_PROFILE_INVALID", "Unsupported metadata refresh interval");
        }
        String options;
        try {
            options = objectMapper.writeValueAsString(section.mapping() == null ? Map.of() : section.mapping());
        } catch (Exception error) {
            throw new ApiException("METADATA_PROFILE_INVALID", "Metadata section mapping is invalid");
        }
        Long queryId = findQueryId(section.queryId());
        jdbc.update("""
                INSERT INTO TB_M26_VIDEO_METADATA_SECTION (
                    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
                    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
                    METADATA_PROFILE_ID, SECTION_CODE, SECTION_TITLE, SECTION_TYPE,
                    TEXT_DISPLAY_MODE, SORT_ORDER, VISIBLE_STATUS, METADATA_QUERY_ID,
                    REFRESH_INTERVAL_SEC, DEFAULT_TEXT, SECTION_OPTIONS, DATA_END_STATUS
                ) VALUES (
                    'U', :objectId, :programId, 'U', :objectId, :programId,
                    :profileId, :sectionCode, :title, :type, :textDisplayMode, :sortOrder,
                    :visibleStatus, :queryId, :interval, :defaultText, :options, 'N'
                )
                """, new org.springframework.jdbc.core.namedparam.MapSqlParameterSource()
                .addValue("objectId", String.valueOf(sourceId))
                .addValue("programId", "METADATA_PROFILE_API")
                .addValue("profileId", profileId)
                .addValue("sectionCode", section.id())
                .addValue("title", section.title())
                .addValue("type", type)
                .addValue("textDisplayMode", "LABEL_VALUE".equalsIgnoreCase(section.textDisplayMode()) ? "LABEL_VALUE" : "FREE")
                .addValue("sortOrder", section.order() == null ? index : section.order())
                .addValue("visibleStatus", Boolean.FALSE.equals(section.visible()) ? "N" : "Y")
                .addValue("queryId", queryId)
                .addValue("interval", interval)
                .addValue("defaultText", section.defaultText())
                .addValue("options", options));
    }

    private Long findQueryId(String queryCode) {
        if (queryCode == null || queryCode.isBlank()) return null;
        return jdbc.query("SELECT METADATA_QUERY_ID FROM TB_M26_METADATA_QUERY WHERE QUERY_CODE = :queryCode AND DATA_END_STATUS = 'N'",
                Map.of("queryCode", queryCode), rows -> rows.next() ? rows.getLong("METADATA_QUERY_ID") : null);
    }

    private Object parseOptions(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try { return objectMapper.readValue(json, Object.class); }
        catch (Exception error) { return Map.of(); }
    }
}
