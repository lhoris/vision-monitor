package com.vision.entity;

import com.vision.entity.audit.BaseAudit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Entity
@Table(name = "TB_M26_MODEL_COMMAND")
@Getter
@Setter
@NoArgsConstructor
public class ModelCommand extends BaseAudit {
    @Id
    @Column(name = "COMMAND_ID", nullable = false, length = 64)
    private String commandId;

    @Column(name = "AGENT_ID", nullable = false, length = 64)
    private String agentId;

    @Column(name = "MODEL_PROCESS_ID", length = 64)
    private String modelProcessId;

    @Column(name = "COMMAND_TYPE", length = 32)
    private String commandType;

    @Column(name = "COMMAND_STATUS", length = 32)
    private String commandStatus;

    @Column(name = "COMMAND_PARAMETERS", columnDefinition = "LONGTEXT")
    private String commandParameters;

    @Column(name = "PROCESSED_AT")
    private Timestamp processedAt;

    @Column(name = "FAILED_REASON", columnDefinition = "LONGTEXT")
    private String failedReason;
}
