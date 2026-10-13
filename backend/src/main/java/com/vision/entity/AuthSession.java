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

import java.time.LocalDateTime;

@Entity
@Table(name = "TB_M26_AUTH_SESSION")
@Getter
@Setter
@NoArgsConstructor
public class AuthSession extends BaseAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AUTH_SESSION_ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "TOKEN_HASH", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "EXPIRES_TIMESTAMP", nullable = false)
    private LocalDateTime expiresTimestamp;

    @Column(name = "LAST_ACCESSED_TIMESTAMP")
    private LocalDateTime lastAccessedTimestamp;

    @Column(name = "REVOKED_TIMESTAMP")
    private LocalDateTime revokedTimestamp;

    @Column(name = "REMARKS", length = 4000)
    private String remarks;

}
