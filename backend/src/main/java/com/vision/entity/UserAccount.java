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
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import com.vision.entity.audit.BaseAudit;

/** M26 사용자 마스터 TB_M26_USER 매핑. */
@Entity
@Table(name = "TB_M26_USER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserAccount extends BaseAudit {

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

    @Column(name = "USER_EMAIL", length = 254)
    private String email;

    @Column(name = "USER_PHONE", length = 50)
    private String phone;

    @Column(name = "REMARKS", length = 4000)
    private String remarks;

    // Transitional API fields are intentionally not persisted in the new master table.
    @Transient private String displayName;
    @Transient private String department;
    @Transient private String position;
    @Transient @Builder.Default private String role = "USER";
    @Transient @Builder.Default private Boolean enabled = true;
    @Transient @Builder.Default private String accountStatus = "active";
    @Transient @Builder.Default private String employmentStatus = "employed";
    @Transient private LocalDateTime lastLoginAt;
    @Transient private Long version;
    @Transient private LocalDateTime deletionRequestedAt;
    @Transient private String deletionRequestedBy;
    @Transient private String deletionReason;
}
