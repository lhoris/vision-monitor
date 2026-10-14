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

import java.sql.Timestamp;

@Entity
@Table(name = "TB_M26_MODEL_EVENT_LOG")
@Getter
@Setter
@NoArgsConstructor
public class ModelEventLog extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MODEL_EVENT_LOG_ID")
    private Long id;

    @Column(name = "MODEL_PROCESS_ID", nullable = false)
    private Long modelProcessId;

    @Column(name = "ACTOR_ID", length = 64)
    private String actorId;

    @Column(name = "OCCURRED_TIMESTAMP", nullable = false)
    private Timestamp occurredTimestamp;

    @Column(name = "SEVERITY", nullable = false, length = 20)
    private String severity;

    @Column(name = "EVENT_TYPE", nullable = false, length = 50)
    private String eventType;

    @Column(name = "MESSAGE", nullable = false, length = 2000)
    private String message;

    @Column(name = "DETECTION_SUMMARY", length = 2000)
    private String detectionSummary;
}
