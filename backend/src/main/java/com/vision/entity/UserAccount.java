package com.vision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_org_unit_id", columnList = "org_unit_id"),
    @Index(name = "idx_users_account_status", columnList = "account_status"),
    @Index(name = "idx_users_employment_status", columnList = "employment_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String username;

    @Column(length = 255)
    private String name;

    @Column(name = "display_name", length = 255)
    private String displayName;

    @Column(length = 255)
    private String email;

    @Column(length = 255)
    private String department;

    @Column(length = 255)
    private String position;

    @Column(length = 50)
    private String phone;

    @Column(name = "org_unit_id")
    private Long orgUnitId;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String role = "USER";

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "account_status", nullable = false, length = 20)
    @Builder.Default
    private String accountStatus = "active";

    @Column(name = "employment_status", nullable = false, length = 20)
    @Builder.Default
    private String employmentStatus = "employed";

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by", length = 255)
    private String updatedBy;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;

    @Column(name = "deletion_requested_at")
    private LocalDateTime deletionRequestedAt;

    @Column(name = "deletion_requested_by", length = 255)
    private String deletionRequestedBy;

    @Column(name = "deletion_reason", length = 500)
    private String deletionReason;
}
