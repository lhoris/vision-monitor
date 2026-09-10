package com.vision.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_M26_CODE_DETAIL")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CodeDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODE_DETAIL_ID") private Long id;
    @Column(name = "CODE_ID") private Long codeId;
    @Column(name = "CODE_VALUE", length = 30) private String value;
    @Column(name = "CODE_VALUE_NAME", length = 100) private String name;
    @Column(name = "CODE_VALUE_DESCRIPTION", length = 1000) private String description;
    @Column(name = "SORT_ORDER") private Integer sortOrder;
    @Column(name = "DEFAULT_VALUE", length = 30) private String defaultValue;
    @Column(name = "REMARKS", length = 4000) private String remarks;
    @Column(name = "DATA_END_STATUS", length = 1) @Builder.Default private String dataEndStatus = "N";
}
