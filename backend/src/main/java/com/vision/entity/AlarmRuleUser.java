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
@Table(name = "TB_M26_ALARM_RULE_USER")
@Getter
@Setter
@NoArgsConstructor
public class AlarmRuleUser extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ALARM_RULE_USER_ID")
    private Long id;

    @Column(name = "ALARM_RULE_ID", nullable = false)
    private Long alarmRuleId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "RECEIVER_STATUS", nullable = false, length = 1)
    private String receiverStatus = "Y";

    @Column(name = "PUSH_ENABLED", nullable = false, length = 1)
    private String pushEnabled = "Y";

    @Column(name = "EMAIL_ENABLED", nullable = false, length = 1)
    private String emailEnabled = "N";

    @Column(name = "TEAMS_ENABLED", nullable = false, length = 1)
    private String teamsEnabled = "N";
}
