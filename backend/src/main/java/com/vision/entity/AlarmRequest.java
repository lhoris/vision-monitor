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

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_M26_ALARM_REQ")
@Getter
@Setter
@NoArgsConstructor
public class AlarmRequest extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ALARM_REQ_ID")
    private Long id;

    @Column(name = "ALARM_RULE_ID", nullable = false)
    private Long alarmRuleId;

    @Column(name = "ALARM_CODE", nullable = false, length = 50)
    private String alarmCode;

    @Column(name = "ALARM_SEVERITY", nullable = false, length = 20)
    private String severity;

    @Column(name = "ALARM_MESSAGE", nullable = false, length = 2000)
    private String message;

    @Column(name = "SOURCE_EVENT_ID", nullable = false, length = 100)
    private String sourceEventId;

    @Column(name = "ALARM_GROUP_ID", length = 100)
    private String alarmGroupId;

    @Column(name = "OCCURRED_TIMESTAMP", nullable = false)
    private LocalDateTime occurredTimestamp;

    @Column(name = "ALARM_CONTEXT", columnDefinition = "TEXT")
    private String context;
}
