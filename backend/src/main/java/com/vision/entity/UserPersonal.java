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
@Table(name = "TB_M26_USER_PERSONAL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JdbcTypeCode(SqlTypes.INTEGER)
    @Column(name = "USER_PERSONAL_ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false)
    @JdbcTypeCode(SqlTypes.INTEGER)
    private Long userId;

    @Column(name = "PERSONAL_NAME", length = 100)
    private String name;

    @Column(name = "PERSONAL_DATA", columnDefinition = "JSON")
    private String data;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Column(name = "DATA_END_STATUS", length = 1)
    @Builder.Default
    private String dataEndStatus = "N";
}
