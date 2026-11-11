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
@Table(name = "TB_M26_ALARM_RULE")
@Getter
@Setter
@NoArgsConstructor
public class AlarmRule extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ALARM_RULE_ID")
    private Long id;

    @Column(name = "ALARM_CODE", nullable = false, length = 50)
    private String code;

    @Column(name = "ALARM_NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "ALARM_NAME_KO", length = 100)
    private String nameKo;

    @Column(name = "ALARM_NAME_EN", length = 100)
    private String nameEn;

    @Column(name = "ALARM_DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "ALARM_CATEGORY", nullable = false, length = 20)
    private String category = "GENERAL";

    @Column(name = "RECIPIENT_SCOPE", nullable = false, length = 20)
    private String recipientScope = "ALL_ADMIN";

    @Column(name = "ACKNOWLEDGEMENT_SCOPE", nullable = false, length = 20)
    private String acknowledgementScope = "INDIVIDUAL";

    @Column(name = "SAVE_STATUS", nullable = false, length = 1)
    private String saveStatus = "Y";

    @Column(name = "RECEIVE_STATUS", nullable = false, length = 1)
    private String receiveStatus = "Y";

    @Column(name = "PUSH_STATUS", nullable = false, length = 1)
    private String pushStatus = "Y";

    @Column(name = "EMAIL_STATUS", nullable = false, length = 1)
    private String emailStatus = "N";

    @Column(name = "TEAMS_STATUS", nullable = false, length = 1)
    private String teamsStatus = "N";
}
