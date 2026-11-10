package com.vision.entity;

import com.vision.entity.audit.BaseAudit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_M26_ALARM_LOG")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmLog extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ALARM_LOG_ID")
    private Long id;

    @Column(name = "ALARM_TYPE", nullable = false, length = 50)
    private String alarmType;

    @Column(name = "ALARM_SEVERITY", nullable = false, length = 20)
    private String severity;

    @Column(name = "ALARM_MESSAGE", nullable = false, length = 2000)
    private String message;

    @Column(name = "ALARM_SOURCE_TYPE", length = 50)
    private String sourceType;

    @Column(name = "ALARM_SOURCE_ID", length = 100)
    private String sourceId;

    @Column(name = "OCCURRED_TIMESTAMP", nullable = false)
    private LocalDateTime occurredTimestamp;

    @Column(name = "TARGET_USER_ID", nullable = false)
    private Long targetUserId;

    @Builder.Default
    @Column(name = "ACKNOWLEDGED_STATUS", length = 1)
    private String acknowledgedStatus = "N";

    @Column(name = "ACKNOWLEDGED_TIMESTAMP")
    private LocalDateTime acknowledgedTimestamp;

    @Column(name = "ACKNOWLEDGED_BY")
    private Long acknowledgedBy;

    @Column(name = "ALARM_CONTEXT", columnDefinition = "TEXT")
    private String context;
}
