package com.vision.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.dto.MetadataQueryExecuteRequest;
import com.vision.dto.MetadataQueryResultDto;
import com.vision.dto.MetadataQuerySummaryDto;
import com.vision.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MetadataQueryService {
    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper objectMapper;
    private final MetadataQueryValidationService validation;

    @Transactional(readOnly = true)
    public List<MetadataQuerySummaryDto> list() {
        return jdbc.query("""
                SELECT METADATA_QUERY_ID, QUERY_CODE, QUERY_NAME, QUERY_DESCRIPTION,
                       RESULT_SCHEMA, USE_STATUS
                FROM TB_M26_METADATA_QUERY
                WHERE USE_STATUS = 'Y' AND DATA_END_STATUS = 'N'
                ORDER BY QUERY_CODE
                """, Map.of(), (rs, rowNum) -> new MetadataQuerySummaryDto(
                rs.getLong("METADATA_QUERY_ID"), rs.getString("QUERY_CODE"),
                rs.getString("QUERY_NAME"), rs.getString("QUERY_DESCRIPTION"),
                parseSchema(rs.getString("RESULT_SCHEMA")), "Y".equalsIgnoreCase(rs.getString("USE_STATUS"))
        ));
    }

    @Transactional(readOnly = true)
    public MetadataQueryResultDto execute(String queryCode, MetadataQueryExecuteRequest request) {
        Map<String, Object> definition = jdbc.query("""
                SELECT QUERY_CODE, SQL_TEXT, RESULT_SCHEMA, QUERY_TIMEOUT_SEC
                FROM TB_M26_METADATA_QUERY
                WHERE QUERY_CODE = :queryCode AND USE_STATUS = 'Y' AND DATA_END_STATUS = 'N'
                """, new MapSqlParameterSource("queryCode", queryCode), rows -> {
            if (!rows.next()) throw new ApiException("METADATA_QUERY_NOT_FOUND", "Metadata query was not found");
            return Map.of(
                    "code", rows.getString("QUERY_CODE"),
                    "sql", rows.getString("SQL_TEXT"),
                    "schema", rows.getString("RESULT_SCHEMA"),
                    "timeout", rows.getInt("QUERY_TIMEOUT_SEC")
            );
        });

        String sql = validation.sql((String) definition.get("sql"));
        Map<String, Object> parameters = request == null || request.parameters() == null
                ? Map.of() : request.parameters();
        if (request != null && request.sourceId() != null) {
            parameters = new java.util.HashMap<>(parameters);
            parameters.putIfAbsent("sourceId", request.sourceId());
        }
        validateParameters(sql, parameters);
        List<Map<String, Object>> rows = jdbc.queryForList(sql, parameters);
        return new MetadataQueryResultDto(queryCode, parseSchema((String) definition.get("schema")), rows, Instant.now());
    }

    private void validateParameters(String sql, Map<String, Object> parameters) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(":([A-Za-z][A-Za-z0-9_]*)").matcher(sql);
        while (matcher.find()) {
            if (!parameters.containsKey(matcher.group(1))) {
                throw new ApiException("METADATA_QUERY_INVALID", "A required query parameter is missing");
            }
        }
    }

    private List<Map<String, Object>> parseSchema(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() { });
        } catch (Exception error) {
            throw new ApiException("METADATA_QUERY_INVALID", "The metadata query schema is invalid");
        }
    }
}
