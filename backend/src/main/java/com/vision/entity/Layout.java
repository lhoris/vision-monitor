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
@Table(name = "layouts", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Layout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tab_name", length = 255)
    private String tabName;

    @Column(columnDefinition = "JSON")
    private String gridConfig; // JSON format: {rows, cols, layout, gapSize}

    @Column(columnDefinition = "JSON")
    private String cameraPositions; // JSON format: [{cameraId, row, col, rowSpan, colSpan}]

    @Column(columnDefinition = "JSON")
    private String tabs; // JSON format: [{id, name, cameras, gridConfig, cameraPositions}]

    @Column(name = "active_tab", length = 100)
    private String activeTab;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}
