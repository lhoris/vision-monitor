package com.vision.repository;

import com.vision.entity.OrgUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrgUnitRepository extends JpaRepository<OrgUnit, Long> {

    Optional<OrgUnit> findByCodeIgnoreCase(String code);

    List<OrgUnit> findAllByActiveTrueOrderByParentIdAscSortOrderAscNameAsc();

    List<OrgUnit> findAllByParentIdAndActiveTrueOrderBySortOrderAscNameAsc(Long parentId);
}
