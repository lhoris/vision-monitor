package com.vision.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
    private static final int PERSONALIZATION_VERSION = 1;
    private static final String DEFAULT_THEME_MODE = "theme2";

    private Long id;
    private Long userId;
    private String tabName;
    private Integer version;
    private ThemeDto theme;
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
        JsonNode personalData = readJson(layout.getPersonalData());
        JsonNode layoutData = personalData == null ? null : personalData.path("layout");
        JsonNode themeData = personalData == null ? null : personalData.path("theme");

        JsonNode tabs = valueOrNull(layoutData, "tabs");
        if (tabs == null) {
            tabs = readJson(layout.getTabs());
        }

        String activeTab = textOrNull(layoutData, "activeTab");
        if (activeTab == null) {
            activeTab = layout.getActiveTab();
        }

        return LayoutDto.builder()
                .id(layout.getId())
                .userId(layout.getUserId())
                .tabName(layout.getTabName())
                .version(intOrDefault(personalData, "version", PERSONALIZATION_VERSION))
                .theme(ThemeDto.builder()
                        .mode(textOrDefault(themeData, "mode", DEFAULT_THEME_MODE))
                        .build())
                .gridConfig(readJson(layout.getGridConfig()))
                .cameraPositions(readJson(layout.getCameraPositions()))
                .tabs(tabs)
                .activeTab(activeTab)
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
                .personalData(writeJson(toPersonalData()))
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    private JsonNode toPersonalData() {
        ObjectNode root = MAPPER.createObjectNode();
        root.put("version", this.version == null ? PERSONALIZATION_VERSION : this.version);

        ObjectNode themeNode = root.putObject("theme");
        themeNode.put("mode", this.theme == null || this.theme.getMode() == null || this.theme.getMode().isBlank()
                ? DEFAULT_THEME_MODE
                : this.theme.getMode());

        ObjectNode layoutNode = root.putObject("layout");
        layoutNode.set("tabs", this.tabs == null ? MAPPER.createArrayNode() : this.tabs);
        layoutNode.put("activeTab", this.activeTab == null ? "" : this.activeTab);
        return root;
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

    private static JsonNode valueOrNull(JsonNode parent, String fieldName) {
        if (parent == null || parent.isMissingNode() || parent.isNull()) {
            return null;
        }
        JsonNode value = parent.get(fieldName);
        return value == null || value.isNull() ? null : value;
    }

    private static String textOrNull(JsonNode parent, String fieldName) {
        JsonNode value = valueOrNull(parent, fieldName);
        return value == null || !value.isTextual() ? null : value.asText();
    }

    private static String textOrDefault(JsonNode parent, String fieldName, String defaultValue) {
        String value = textOrNull(parent, fieldName);
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private static int intOrDefault(JsonNode parent, String fieldName, int defaultValue) {
        JsonNode value = valueOrNull(parent, fieldName);
        return value == null || !value.canConvertToInt() ? defaultValue : value.asInt();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ThemeDto {
        private String mode;
    }

}
