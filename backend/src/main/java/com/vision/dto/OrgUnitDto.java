package com.vision.dto;

import com.vision.entity.OrgUnit;

public record OrgUnitDto(
        Long id,
        Long parentId,
        String unitType,
        String code,
        String name,
        Boolean active,
        Integer sortOrder
) {
    public static OrgUnitDto from(OrgUnit unit) {
        return new OrgUnitDto(
                unit.getId(), unit.getParentId(), unit.getUnitType(), unit.getCode(),
                unit.getName(), unit.getActive(), unit.getSortOrder()
        );
    }
}
