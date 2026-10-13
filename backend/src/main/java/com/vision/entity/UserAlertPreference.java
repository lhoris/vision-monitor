package com.vision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.vision.entity.audit.BaseAudit;

@Entity
@Table(name = "TB_M26_USER_ALERT_PREF")
@Getter
@Setter
@NoArgsConstructor
public class UserAlertPreference extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ALERT_PREF_ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "EMAIL_ENABLED", nullable = false, length = 1)
    private String emailEnabled = "N";

    @Column(name = "SMS_ENABLED", nullable = false, length = 1)
    private String smsEnabled = "N";

}
