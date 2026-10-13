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
@Table(name = "TB_M26_MODEL_PROCESS")
@Getter
@Setter
@NoArgsConstructor
public class ModelProcess extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MODEL_PROCESS_ID")
    private Long id;

    @Column(name = "PROCESS_AREA_CODE", nullable = false, length = 30)
    private String processAreaCode;

    @Column(name = "MODEL_NAME", nullable = false, length = 200)
    private String modelName;

    @Column(name = "AUTOMATION_NAME", nullable = false, length = 200)
    private String automationName;

    @Column(name = "SERVER_IP", nullable = false, length = 45)
    private String serverIp;

    @Column(name = "AGENT_ID", length = 64)
    private String agentId;

    @Column(name = "PROCESS_PID")
    private Integer processPid;

    @Column(name = "PYTHON_PROJECT_PATH", nullable = false, length = 1000)
    private String pythonProjectPath;

    @Column(name = "PROCESS_STATUS", nullable = false, length = 20)
    private String processStatus = "UNKNOWN";

    @Column(name = "MONITORING_STATUS", nullable = false, length = 20)
    private String monitoringStatus = "UNKNOWN";

    @Column(name = "CONTROL_STATUS", nullable = false, length = 20)
    private String controlStatus = "UNKNOWN";

    @Column(name = "LAST_STATUS_TIMESTAMP")
    private Timestamp lastStatusTimestamp;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;
}
