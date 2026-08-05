package com.vision.dto;

import com.vision.entity.Layout;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Layout DTO - 개인화 그리드 레이아웃
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LayoutDto {

    private Long id;
    private Long userId;
    private String tabName;
    private String gridConfig;
    private String cameraPositions;
    private String tabs;
    private String activeTab;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LayoutDto fromEntity(Layout layout) {
        return LayoutDto.builder()
                .id(layout.getId())
                .userId(layout.getUserId())
                .tabName(layout.getTabName())
                .gridConfig(layout.getGridConfig())
                .cameraPositions(layout.getCameraPositions())
                .tabs(layout.getTabs())
                .activeTab(layout.getActiveTab())
                .createdAt(layout.getCreatedAt())
                .updatedAt(layout.getUpdatedAt())
                .build();
    }

    public Layout toEntity() {
        return Layout.builder()
                .id(this.id)
                .userId(this.userId)
                .tabName(this.tabName)
                .gridConfig(this.gridConfig)
                .cameraPositions(this.cameraPositions)
                .tabs(this.tabs)
                .activeTab(this.activeTab)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

}
