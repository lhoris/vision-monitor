package com.vision.dto;

import com.vision.entity.CodeDetail;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CommonCodeDetailDto {
    private Long id; private Long codeId; private String value; private String name; private String nameKo; private String nameEn; private String description;
    private Integer sortOrder; private String defaultValue; private String remarks; private String dataEndStatus;
    public static CommonCodeDetailDto from(CodeDetail d) { return builder().id(d.getId()).codeId(d.getCodeId()).value(d.getValue()).name(d.getName()).nameKo(d.getNameKo()).nameEn(d.getNameEn()).description(d.getDescription()).sortOrder(d.getSortOrder()).defaultValue(d.getDefaultValue()).remarks(d.getRemarks()).dataEndStatus(d.getDataEndStatus()).build(); }
}
