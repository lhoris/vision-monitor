package com.vision.service;

import com.vision.dto.AuthenticatedUserDto;
import com.vision.dto.MetadataQueryAdminDto;
import com.vision.dto.MetadataQueryAdminRequest;
import com.vision.entity.MetadataQuery;
import com.vision.exception.ApiException;
import com.vision.repository.MetadataQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MetadataQueryAdminService {
    private final NamedParameterJdbcTemplate jdbc;
    private final MetadataQueryRepository queryRepository;
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
                """, new MapSqlParameterSource().addValue("keyword", normalizedKeyword)
                .addValue("likeKeyword", "%" + normalizedKeyword + "%").addValue("status", normalizedStatus),
                (rs, rowNum) -> toDto(rs));
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
        if (queryRepository.existsByQueryCode(normalized.queryCode())) {
            throw new ApiException("METADATA_QUERY_DUPLICATE", "A query with the same Query ID already exists.");
        }
        MetadataQuery entity = new MetadataQuery();
        apply(entity, normalized);
        queryRepository.save(entity);
        return get(actor, normalized.queryCode());
    }

    @Transactional
    public MetadataQueryAdminDto update(AuthenticatedUserDto actor, String queryCode, MetadataQueryAdminRequest request) {
        requirePermission(actor);
        NormalizedQuery normalized = normalize(request);
        if (!queryCode.equals(normalized.queryCode())) {
            throw new ApiException("METADATA_QUERY_INVALID", "Query ID cannot be changed.");
        }
        MetadataQuery entity = activeEntity(queryCode);
        apply(entity, normalized);
        queryRepository.save(entity);
        return get(actor, queryCode);
    }

    @Transactional
    public MetadataQueryAdminDto setStatus(AuthenticatedUserDto actor, String queryCode, boolean enabled) {
        requirePermission(actor);
        MetadataQuery entity = activeEntity(queryCode);
        entity.setUseStatus(enabled ? "Y" : "N");
        queryRepository.save(entity);
        return get(actor, queryCode);
    }

    @Transactional
    public void delete(AuthenticatedUserDto actor, String queryCode) {
        requirePermission(actor);
        MetadataQueryAdminDto query = get(actor, queryCode);
        if (query.referenceCount() > 0) {
            throw new ApiException("METADATA_QUERY_REFERENCED", "The query cannot be deleted while it is referenced by a metadata section.");
        }
        MetadataQuery entity = activeEntity(queryCode);
        entity.setDataEndStatus("Y");
        queryRepository.save(entity);
    }

    private MetadataQuery activeEntity(String queryCode) {
        return queryRepository.findByQueryCodeAndDataEndStatus(queryCode, "N")
                .orElseThrow(this::notFound);
    }

    private void apply(MetadataQuery entity, NormalizedQuery query) {
        entity.setQueryCode(query.queryCode());
        entity.setQueryName(query.name());
        entity.setQueryDescription(query.description());
        entity.setSqlText(query.sql());
        entity.setParameterSchema(query.parameters());
        entity.setResultSchema(query.schema());
        entity.setQueryTimeoutSec(query.timeout());
        entity.setUseStatus(query.useStatus());
    }

    private NormalizedQuery normalize(MetadataQueryAdminRequest request) {
        if (request == null) throw new ApiException("METADATA_QUERY_INVALID", "Query information is required.");
        return new NormalizedQuery(validation.queryCode(request.queryCode()),
                validation.requiredText(request.queryName(), "Query name", 200),
                validation.optionalText(request.queryDescription(), 1000), validation.sql(request.sqlText()),
                validation.json(request.parameterSchema(), "Parameter schema"), validation.json(request.resultSchema(), "Result schema"),
                validation.timeout(request.queryTimeoutSec()), validation.useStatus(request.useStatus()));
    }

    private void requirePermission(AuthenticatedUserDto actor) {
        if (actor == null || actor.permissions() == null || actor.permissions().stream().noneMatch(permission ->
                "admin:access".equalsIgnoreCase(permission) || "query:manage".equalsIgnoreCase(permission))) {
            throw new ApiException("FORBIDDEN", "You do not have permission to manage queries.");
        }
    }

    private ApiException notFound() { return new ApiException("METADATA_QUERY_NOT_FOUND", "The query was not found."); }

    private MetadataQueryAdminDto toDto(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new MetadataQueryAdminDto(rs.getLong("METADATA_QUERY_ID"), rs.getString("QUERY_CODE"), rs.getString("QUERY_NAME"),
                rs.getString("QUERY_DESCRIPTION"), rs.getString("SQL_TEXT"), rs.getString("PARAMETER_SCHEMA"),
                rs.getString("RESULT_SCHEMA"), rs.getInt("QUERY_TIMEOUT_SEC"), "Y".equals(rs.getString("USE_STATUS")),
                "Y".equals(rs.getString("DATA_END_STATUS")), rs.getLong("REFERENCE_COUNT"), rs.getTimestamp("LAST_UPDATED_TIMESTAMP").toLocalDateTime());
    }

    private record NormalizedQuery(String queryCode, String name, String description, String sql, String parameters,
                                   String schema, int timeout, String useStatus) {}
}
