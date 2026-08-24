package com.vision.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Long id;
    private Long userId;
    private String tabName;
    private JsonNode gridConfig;
    private JsonNode cameraPositions;
    private JsonNode tabs;
    private String activeTab;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LayoutDto fromEntity(Layout layout) {
        if (layout == null) {
            return null;
        }
        return LayoutDto.builder()
                .id(layout.getId())
                .userId(layout.getUserId())
                .tabName(layout.getTabName())
                .gridConfig(readJson(layout.getGridConfig()))
                .cameraPositions(readJson(layout.getCameraPositions()))
                .tabs(readJson(layout.getTabs()))
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
                .gridConfig(writeJson(this.gridConfig))
                .cameraPositions(writeJson(this.cameraPositions))
                .tabs(writeJson(this.tabs))
                .activeTab(this.activeTab)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    private static JsonNode readJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return MAPPER.readTree(json);
        } catch (Exception exception) {
            return null;
        }
    }

    private static String writeJson(JsonNode json) {
        if (json == null || json.isNull()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(json);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid layout JSON", exception);
        }
    }

}
