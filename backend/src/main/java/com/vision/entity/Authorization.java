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
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "TB_M26_AUTH")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Authorization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JdbcTypeCode(SqlTypes.INTEGER)
    @Column(name = "AUTH_ID")
    private Long id;

    @Column(name = "AUTH_CODE", length = 30)
    private String code;

    @Column(name = "AUTH_NAME", length = 100)
    private String name;

    @Column(name = "AUTH_TYPE", length = 8)
    private String type;

    @Column(name = "AUTH_DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "DATA_END_STATUS", length = 1)
    @Builder.Default
    private String dataEndStatus = "N";
}
