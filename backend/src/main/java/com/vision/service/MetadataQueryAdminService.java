package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.MetadataQueryAdminDto;
import com.vision.dto.MetadataQueryAdminRequest;
import com.vision.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MetadataQueryAdminService {
    private static final String PROGRAM_ID = "QUERY-MGMT";
    private final NamedParameterJdbcTemplate jdbc;
    private final MetadataQueryValidationService validation;

    @Transactional(readOnly = true)
    public List<MetadataQueryAdminDto> list(AuthenticatedUserDto actor, String keyword, String status) {
        requirePermission(actor);
        String normalizedStatus = status == null || status.isBlank() ? "ALL" : status.toUpperCase();
        String normalizedKeyword = keyword == null ? "" : keyword.trim();
        return jdbc.query("""
                SELECT q.METADATA_QUERY_ID, q.QUERY_CODE, q.QUERY_NAME, q.QUERY_DESCRIPTION,
                       q.SQL_TEXT, q.PARAMETER_SCHEMA, q.RESULT_SCHEMA, q.QUERY_TIMEOUT_SEC,
                       q.USE_STATUS, q.DATA_END_STATUS, q.LAST_UPDATED_TIMESTAMP,
                       (SELECT COUNT(*) FROM TB_M26_VIDEO_METADATA_SECTION s
                        WHERE s.METADATA_QUERY_ID = q.METADATA_QUERY_ID AND s.DATA_END_STATUS = 'N') AS REFERENCE_COUNT
                FROM TB_M26_METADATA_QUERY q
                WHERE (:keyword = '' OR q.QUERY_CODE LIKE :likeKeyword OR q.QUERY_NAME LIKE :likeKeyword)
                  AND (:status = 'ALL' OR (:status = 'ACTIVE' AND q.USE_STATUS = 'Y' AND q.DATA_END_STATUS = 'N')
                       OR (:status = 'INACTIVE' AND q.USE_STATUS = 'N' AND q.DATA_END_STATUS = 'N')
                       OR (:status = 'DELETED' AND q.DATA_END_STATUS = 'Y'))
                ORDER BY q.QUERY_CODE
                """, new MapSqlParameterSource()
                .addValue("keyword", normalizedKeyword)
                .addValue("likeKeyword", "%" + normalizedKeyword + "%")
                .addValue("status", normalizedStatus), (rs, rowNum) -> toDto(rs));
    }

    @Transactional(readOnly = true)
    public MetadataQueryAdminDto get(AuthenticatedUserDto actor, String queryCode) {
        requirePermission(actor);
        return jdbc.query("""
                SELECT q.METADATA_QUERY_ID, q.QUERY_CODE, q.QUERY_NAME, q.QUERY_DESCRIPTION,
                       q.SQL_TEXT, q.PARAMETER_SCHEMA, q.RESULT_SCHEMA, q.QUERY_TIMEOUT_SEC,
                       q.USE_STATUS, q.DATA_END_STATUS, q.LAST_UPDATED_TIMESTAMP,
                       (SELECT COUNT(*) FROM TB_M26_VIDEO_METADATA_SECTION s
                        WHERE s.METADATA_QUERY_ID = q.METADATA_QUERY_ID AND s.DATA_END_STATUS = 'N') AS REFERENCE_COUNT
                FROM TB_M26_METADATA_QUERY q WHERE q.QUERY_CODE = :queryCode
                """, new MapSqlParameterSource("queryCode", queryCode), rows -> {
            if (!rows.next()) throw notFound();
            return toDto(rows);
        });
    }

    @Transactional
    public MetadataQueryAdminDto create(AuthenticatedUserDto actor, MetadataQueryAdminRequest request) {
        requirePermission(actor);
        NormalizedQuery normalized = normalize(request);
        if (exists(normalized.queryCode())) throw new ApiException("METADATA_QUERY_DUPLICATE", "이미 등록된 Query ID입니다.");
        LocalDateTime now = LocalDateTime.now();
        MapSqlParameterSource params = auditParams(actor, normalized, now)
                .addValue("queryId", normalized.queryCode());
        jdbc.update("""
                INSERT INTO TB_M26_METADATA_QUERY (
                    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID, CREATED_TIMESTAMP,
                    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID, LAST_UPDATED_TIMESTAMP,
                    DATA_END_STATUS, QUERY_CODE, QUERY_NAME, QUERY_DESCRIPTION, SQL_TEXT,
                    PARAMETER_SCHEMA, RESULT_SCHEMA, QUERY_TIMEOUT_SEC, USE_STATUS
                ) VALUES ('U', :actor, :program, :now, 'U', :actor, :program, :now, 'N',
                          :queryId, :name, :description, :sql, :parameters, :schema, :timeout, :useStatus)
                """, params);
        return get(actor, normalized.queryCode());
    }

    @Transactional
    public MetadataQueryAdminDto update(AuthenticatedUserDto actor, String queryCode, MetadataQueryAdminRequest request) {
        requirePermission(actor);
        NormalizedQuery normalized = normalize(request);
        if (!queryCode.equals(normalized.queryCode())) throw new ApiException("METADATA_QUERY_INVALID", "Query ID는 수정할 수 없습니다.");
        get(actor, queryCode);
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                UPDATE TB_M26_METADATA_QUERY
                SET QUERY_NAME = :name, QUERY_DESCRIPTION = :description, SQL_TEXT = :sql,
                    PARAMETER_SCHEMA = :parameters, RESULT_SCHEMA = :schema,
                    QUERY_TIMEOUT_SEC = :timeout, USE_STATUS = :useStatus,
                    LAST_UPDATED_OBJECT_TYPE = 'U', LAST_UPDATED_OBJECT_ID = :actor,
                    LAST_UPDATED_PROGRAM_ID = :program, LAST_UPDATED_TIMESTAMP = :now
                WHERE QUERY_CODE = :queryCode AND DATA_END_STATUS = 'N'
                """, auditParams(actor, normalized, now).addValue("queryCode", queryCode));
        return get(actor, queryCode);
    }

    @Transactional
    public MetadataQueryAdminDto setStatus(AuthenticatedUserDto actor, String queryCode, boolean enabled) {
        requirePermission(actor);
        get(actor, queryCode);
        jdbc.update("""
                UPDATE TB_M26_METADATA_QUERY
                SET USE_STATUS = :status, LAST_UPDATED_OBJECT_TYPE = 'U', LAST_UPDATED_OBJECT_ID = :actor,
                    LAST_UPDATED_PROGRAM_ID = :program, LAST_UPDATED_TIMESTAMP = :now
                WHERE QUERY_CODE = :queryCode AND DATA_END_STATUS = 'N'
                """, new MapSqlParameterSource().addValue("status", enabled ? "Y" : "N")
                        .addValue("actor", actor.username()).addValue("program", PROGRAM_ID)
                        .addValue("now", LocalDateTime.now()).addValue("queryCode", queryCode));
        return get(actor, queryCode);
    }

    @Transactional
    public void delete(AuthenticatedUserDto actor, String queryCode) {
        requirePermission(actor);
        MetadataQueryAdminDto query = get(actor, queryCode);
        if (query.referenceCount() > 0) throw new ApiException("METADATA_QUERY_REFERENCED", "메타데이터 섹션에서 사용 중인 Query는 삭제할 수 없습니다.");
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("""
                UPDATE TB_M26_METADATA_QUERY
                SET DATA_END_STATUS = 'Y', DATA_END_OBJECT_TYPE = 'U', DATA_END_OBJECT_ID = :actor,
                    DATA_END_PROGRAM_ID = :program, DATA_END_TIMESTAMP = :now,
                    LAST_UPDATED_OBJECT_TYPE = 'U', LAST_UPDATED_OBJECT_ID = :actor,
                    LAST_UPDATED_PROGRAM_ID = :program, LAST_UPDATED_TIMESTAMP = :now
                WHERE QUERY_CODE = :queryCode AND DATA_END_STATUS = 'N'
                """, new MapSqlParameterSource().addValue("actor", actor.username())
                        .addValue("program", PROGRAM_ID).addValue("now", now).addValue("queryCode", queryCode));
    }

    private NormalizedQuery normalize(MetadataQueryAdminRequest request) {
        if (request == null) throw new ApiException("METADATA_QUERY_INVALID", "Query 정보를 입력해 주세요.");
        return new NormalizedQuery(validation.queryCode(request.queryCode()),
                validation.requiredText(request.queryName(), "Query 명칭", 200),
                validation.optionalText(request.queryDescription(), 1000), validation.sql(request.sqlText()),
                validation.json(request.parameterSchema(), "파라미터 정의"), validation.json(request.resultSchema(), "결과 Schema"),
                validation.timeout(request.queryTimeoutSec()), validation.useStatus(request.useStatus()));
    }

    private MapSqlParameterSource auditParams(AuthenticatedUserDto actor, NormalizedQuery query, LocalDateTime now) {
        return new MapSqlParameterSource().addValue("actor", actor.username()).addValue("program", PROGRAM_ID)
                .addValue("now", now).addValue("name", query.name()).addValue("description", query.description())
                .addValue("sql", query.sql()).addValue("parameters", query.parameters()).addValue("schema", query.schema())
                .addValue("timeout", query.timeout()).addValue("useStatus", query.useStatus());
    }

    private boolean exists(String queryCode) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM TB_M26_METADATA_QUERY WHERE QUERY_CODE = :code)",
                new MapSqlParameterSource("code", queryCode), Boolean.class));
    }

    private void requirePermission(AuthenticatedUserDto actor) {
        if (actor == null || actor.permissions() == null || actor.permissions().stream().noneMatch(permission ->
                "admin:access".equalsIgnoreCase(permission) || "query:manage".equalsIgnoreCase(permission))) {
            throw new ApiException("FORBIDDEN", "Query 관리 권한이 없습니다.");
        }
    }

    private ApiException notFound() { return new ApiException("METADATA_QUERY_NOT_FOUND", "Query를 찾을 수 없습니다."); }

    private MetadataQueryAdminDto toDto(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new MetadataQueryAdminDto(rs.getLong("METADATA_QUERY_ID"), rs.getString("QUERY_CODE"), rs.getString("QUERY_NAME"),
                rs.getString("QUERY_DESCRIPTION"), rs.getString("SQL_TEXT"), rs.getString("PARAMETER_SCHEMA"),
                rs.getString("RESULT_SCHEMA"), rs.getInt("QUERY_TIMEOUT_SEC"), "Y".equals(rs.getString("USE_STATUS")),
                "Y".equals(rs.getString("DATA_END_STATUS")), rs.getLong("REFERENCE_COUNT"), rs.getTimestamp("LAST_UPDATED_TIMESTAMP").toLocalDateTime());
    }

    private record NormalizedQuery(String queryCode, String name, String description, String sql, String parameters,
                                   String schema, int timeout, String useStatus) {}
}
