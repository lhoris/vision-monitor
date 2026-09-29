package com.vision.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vision.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MetadataQueryValidationServiceTest {
    private MetadataQueryValidationService validation;

    @BeforeEach
    void setUp() {
        validation = new MetadataQueryValidationService(new ObjectMapper());
    }

    @Test
    void acceptsReadOnlySelectAndWithQueries() {
        assertThat(validation.sql("SELECT STATUS FROM TB_M26_VIDEO_SOURCE")).startsWith("SELECT");
        assertThat(validation.sql("WITH recent AS (SELECT 1 AS value) SELECT value FROM recent")).startsWith("WITH");
    }

    @Test
    void rejectsMutatingAndMultipleStatements() {
        assertThatThrownBy(() -> validation.sql("UPDATE TB_M26_VIDEO_SOURCE SET STATUS = 'ACTIVE'"))
                .isInstanceOf(ApiException.class).hasMessageContaining("조회 전용");
        assertThatThrownBy(() -> validation.sql("SELECT 1; SELECT 2"))
                .isInstanceOf(ApiException.class).hasMessageContaining("다중 SQL");
    }

    @Test
    void validatesQueryCodeJsonAndTimeout() {
        assertThatThrownBy(() -> validation.queryCode("camera status"))
                .isInstanceOf(ApiException.class);
        assertThat(validation.json("[{\"name\":\"status\"}]", "결과 Schema")).contains("status");
        assertThatThrownBy(() -> validation.timeout(61)).isInstanceOf(ApiException.class);
    }
}
