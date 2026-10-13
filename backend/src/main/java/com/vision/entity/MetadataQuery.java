package com.vision.entity;

import com.vision.entity.audit.BaseAudit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TB_M26_METADATA_QUERY")
@Getter
@Setter
@NoArgsConstructor
public class MetadataQuery extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "METADATA_QUERY_ID")
    private Long id;
    @Column(name = "QUERY_CODE", nullable = false, length = 100) private String queryCode;
    @Column(name = "QUERY_NAME", nullable = false, length = 200) private String queryName;
    @Column(name = "QUERY_DESCRIPTION", length = 1000) private String queryDescription;
    @Column(name = "SQL_TEXT", nullable = false, columnDefinition = "LONGTEXT") private String sqlText;
    @Column(name = "PARAMETER_SCHEMA", columnDefinition = "LONGTEXT") private String parameterSchema;
    @Column(name = "RESULT_SCHEMA", columnDefinition = "LONGTEXT") private String resultSchema;
    @Column(name = "QUERY_TIMEOUT_SEC", nullable = false) private Integer queryTimeoutSec = 5;
    @Column(name = "USE_STATUS", nullable = false, length = 1) private String useStatus = "Y";
}
