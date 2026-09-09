package com.vision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** M26 사용자 마스터 TB_M26_USER 매핑. */
@Entity
@Table(name = "TB_M26_USER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JdbcTypeCode(SqlTypes.INTEGER)
    @Column(name = "USER_ID")
    private Long id;

    @Column(name = "USER_EMP_NO", nullable = false, length = 20)
    private String username;

    @Column(name = "ENCRYPTED_FOUNDATION_PASSWORD", length = 100)
    private String passwordHash;

    @Column(name = "USER_NAME", length = 100)
    private String name;

    @Column(name = "REMARKS", length = 4000)
    private String remarks;

    @Column(name = "DATA_END_STATUS", length = 1)
    @Builder.Default
    private String dataEndStatus = "N";

    @Column(name = "CREATED_TIMESTAMP")
    private LocalDateTime createdTimestamp;

    @Column(name = "CREATED_OBJECT_ID", length = 22)
    private String createdBy;

    @Column(name = "LAST_UPDATED_TIMESTAMP")
    private LocalDateTime updatedTimestamp;

    @Column(name = "LAST_UPDATED_OBJECT_ID", length = 22)
    private String updatedBy;

    // Transitional API fields are intentionally not persisted in the new master table.
    @Transient private String displayName;
    @Transient private String email;
    @Transient private String department;
    @Transient private String position;
    @Transient private String phone;
    @Transient private Long orgUnitId;
    @Transient @Builder.Default private String role = "USER";
    @Transient @Builder.Default private Boolean enabled = true;
    @Transient @Builder.Default private String accountStatus = "active";
    @Transient @Builder.Default private String employmentStatus = "employed";
    @Transient private LocalDateTime lastLoginAt;
    @Transient private LocalDateTime createdAt;
    @Transient private LocalDateTime updatedAt;
    @Transient private Long version;
    @Transient private LocalDateTime deletionRequestedAt;
    @Transient private String deletionRequestedBy;
    @Transient private String deletionReason;
}
