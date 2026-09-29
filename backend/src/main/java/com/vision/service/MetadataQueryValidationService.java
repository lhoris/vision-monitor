package com.vision.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MetadataQueryValidationService {
    private static final Pattern QUERY_CODE = Pattern.compile("[A-Za-z0-9._-]+" );
    private static final Pattern FORBIDDEN = Pattern.compile(
            "\\b(insert|update|delete|drop|alter|create|truncate|replace|merge|call|grant|revoke|set|use)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final int MAX_TIMEOUT_SECONDS = 60;
    private final ObjectMapper objectMapper;

    public String queryCode(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank() || normalized.length() > 100 || !QUERY_CODE.matcher(normalized).matches()) {
            throw new ApiException("METADATA_QUERY_INVALID", "Query ID는 영문, 숫자, 점, 하이픈, 밑줄만 사용할 수 있습니다.");
        }
        return normalized;
    }

    public String requiredText(String value, String label, int maxLength) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank() || normalized.length() > maxLength) {
            throw new ApiException("METADATA_QUERY_INVALID", label + "은(는) 필수이며 허용 길이를 초과할 수 없습니다.");
        }
        return normalized;
    }

    public String optionalText(String value, int maxLength) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new ApiException("METADATA_QUERY_INVALID", "입력값이 허용 길이를 초과했습니다.");
        }
        return normalized;
    }

    public String sql(String value) {
        String normalized = value == null ? "" : value.trim();
        String upper = normalized.toUpperCase(Locale.ROOT);
        if (normalized.isBlank() || !(upper.startsWith("SELECT ") || upper.startsWith("SELECT\n") || upper.startsWith("WITH "))) {
            throw new ApiException("METADATA_QUERY_INVALID", "조회 전용 SELECT 또는 WITH SQL만 등록할 수 있습니다.");
        }
        if (normalized.contains(";") || normalized.contains("--") || normalized.contains("/*") || FORBIDDEN.matcher(normalized).find()) {
            throw new ApiException("METADATA_QUERY_INVALID", "데이터 변경, DDL, 주석 또는 다중 SQL 문장은 등록할 수 없습니다.");
        }
        return normalized;
    }

    public String json(String value, String label) {
        if (value == null || value.isBlank()) return null;
        try {
            JsonNode node = objectMapper.readTree(value);
            if (!node.isArray() && !node.isObject()) throw new IllegalArgumentException();
            return node.toString();
        } catch (Exception error) {
            throw new ApiException("METADATA_QUERY_INVALID", label + "은(는) 유효한 JSON이어야 합니다.");
        }
    }

    public int timeout(Integer value) {
        int normalized = value == null ? 5 : value;
        if (normalized < 1 || normalized > MAX_TIMEOUT_SECONDS) {
            throw new ApiException("METADATA_QUERY_INVALID", "조회 제한시간은 1초에서 60초 사이여야 합니다.");
        }
        return normalized;
    }

    public String useStatus(String value) {
        String normalized = value == null || value.isBlank() ? "Y" : value.trim().toUpperCase(Locale.ROOT);
        if (!"Y".equals(normalized) && !"N".equals(normalized)) {
            throw new ApiException("METADATA_QUERY_INVALID", "사용 여부가 올바르지 않습니다.");
        }
        return normalized;
    }
}
