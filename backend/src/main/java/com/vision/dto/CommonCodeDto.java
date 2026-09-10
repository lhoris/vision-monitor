package com.vision.dto;

import com.vision.entity.Code;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CommonCodeDto {
    private Long id; private String name; private String description; private String type; private String remarks; private String dataEndStatus; private List<CommonCodeDetailDto> details;
    public static CommonCodeDto from(Code c, List<CommonCodeDetailDto> details) { return builder().id(c.getId()).name(c.getName()).description(c.getDescription()).type(c.getType()).remarks(c.getRemarks()).dataEndStatus(c.getDataEndStatus()).details(details).build(); }
}
