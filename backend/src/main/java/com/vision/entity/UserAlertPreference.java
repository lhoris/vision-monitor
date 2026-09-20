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

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_M26_USER_ALERT_PREF")
@Getter
@Setter
@NoArgsConstructor
public class UserAlertPreference {
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

    @Column(name = "CREATED_OBJECT_TYPE", length = 1)
    private String createdObjectType = "U";

    @Column(name = "CREATED_OBJECT_ID", length = 22)
    private String createdObjectId;

    @Column(name = "CREATED_PROGRAM_ID", length = 22)
    private String createdProgramId = "USER_ALERT_PREF";

    @Column(name = "CREATED_TIMESTAMP")
    private LocalDateTime createdTimestamp;

    @Column(name = "LAST_UPDATED_OBJECT_TYPE", length = 1)
    private String updatedObjectType = "U";

    @Column(name = "LAST_UPDATED_OBJECT_ID", length = 22)
    private String updatedObjectId;

    @Column(name = "LAST_UPDATED_PROGRAM_ID", length = 22)
    private String updatedProgramId = "USER_ALERT_PREF";

    @Column(name = "LAST_UPDATED_TIMESTAMP")
    private LocalDateTime updatedTimestamp;

    @Column(name = "DATA_END_STATUS", length = 1)
    private String dataEndStatus = "N";

    @Column(name = "DATA_END_OBJECT_TYPE", length = 1)
    private String dataEndObjectType;

    @Column(name = "DATA_END_OBJECT_ID", length = 22)
    private String dataEndObjectId;

    @Column(name = "DATA_END_PROGRAM_ID", length = 22)
    private String dataEndProgramId;

    @Column(name = "DATA_END_TIMESTAMP")
    private LocalDateTime dataEndTimestamp;
}
