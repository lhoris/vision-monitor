package com.vision.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RuntimeCommonCodeDto {
    private String version; private Map<String, CommonCodeGroupDto> codes;
    @Data @Builder @NoArgsConstructor @AllArgsConstructor public static class CommonCodeGroupDto { private String code; private String description; private String type; private List<CommonCodeItemDto> items; }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor public static class CommonCodeItemDto { private Long id; private String value; private String name; private String description; private Integer sortOrder; private String defaultValue; }
}
