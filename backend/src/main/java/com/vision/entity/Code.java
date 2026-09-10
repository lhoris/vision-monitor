package com.vision.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_M26_CODE")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Code {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODE_ID") private Long id;
    @Column(name = "CODE_NAME", length = 50) private String name;
    @Column(name = "CODE_DESCRIPTION", length = 120) private String description;
    @Column(name = "CODE_TYPE", length = 20) private String type;
    @Column(name = "REMARKS", length = 4000) private String remarks;
    @Column(name = "DATA_END_STATUS", length = 1) @Builder.Default private String dataEndStatus = "N";
}
