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
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MetadataQueryService {
    private static final Pattern PARAMETER = Pattern.compile(":([A-Za-z][A-Za-z0-9_]*)");
    private static final Pattern FORBIDDEN = Pattern.compile("\\b(insert|update|delete|drop|alter|create|truncate|replace|merge|call|grant|revoke)\\b", Pattern.CASE_INSENSITIVE);

    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

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

        String sql = validateSql((String) definition.get("sql"));
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

    private String validateSql(String sql) {
        String normalized = sql == null ? "" : sql.trim();
        String upper = normalized.toUpperCase(Locale.ROOT);
        if (normalized.isBlank() || !(upper.startsWith("SELECT ") || upper.startsWith("SELECT\n") || upper.startsWith("WITH "))) {
            throw new ApiException("METADATA_QUERY_INVALID", "Only read-only metadata queries are allowed");
        }
        if (normalized.contains(";") || normalized.contains("--") || normalized.contains("/*") || FORBIDDEN.matcher(normalized).find()) {
            throw new ApiException("METADATA_QUERY_INVALID", "The metadata query contains a forbidden statement");
        }
        return normalized;
    }

    private void validateParameters(String sql, Map<String, Object> parameters) {
        Matcher matcher = PARAMETER.matcher(sql);
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
