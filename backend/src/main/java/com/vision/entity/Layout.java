package com.vision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Layout Entity - 사용자 맞춤 카메라 그리드 레이아웃
 */
@Entity
@Table(name = "TB_M26_USER_PERSONAL", indexes = {
    @Index(name = "idx_tb_m26_user_personal_user_id", columnList = "USER_ID")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Layout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_PERSONAL_ID")
    private Long id;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "PERSONAL_NAME", length = 100)
    private String tabName;

    @Transient
    private String gridConfig; // JSON format: {rows, cols, layout, gapSize}

    @Transient
    private String cameraPositions; // JSON format: [{cameraId, row, col, rowSpan, colSpan}]

    @Transient
    private String tabs; // JSON format: [{id, name, cameras, gridConfig, cameraPositions}]

    @Transient
    private String activeTab;

    @Column(name = "PERSONAL_DATA", columnDefinition = "JSON")
    private String personalData;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Transient
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}
