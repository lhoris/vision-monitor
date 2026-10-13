package com.vision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import com.vision.entity.audit.BaseAudit;

@Entity
@Table(name = "TB_M26_USER_AUTH")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserAuthorization extends BaseAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JdbcTypeCode(SqlTypes.INTEGER)
    @Column(name = "USER_AUTH_ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false)
    @JdbcTypeCode(SqlTypes.INTEGER)
    private Long userId;

    @Column(name = "AUTH_ID", nullable = false)
    @JdbcTypeCode(SqlTypes.INTEGER)
    private Long authId;

    @Column(name = "GRANT_START_DT", length = 8)
    private String grantStartDate;

    @Column(name = "GRANT_END_DT", length = 8)
    private String grantEndDate;

}
