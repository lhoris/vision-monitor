package com.vision.repository;

import com.vision.entity.CodeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodeDetailRepository extends JpaRepository<CodeDetail, Long> {
    List<CodeDetail> findAllByCodeIdAndDataEndStatusOrderBySortOrderAscIdAsc(Long codeId, String dataEndStatus);
    List<CodeDetail> findAllByCodeIdOrderBySortOrderAscIdAsc(Long codeId);
    boolean existsByCodeIdAndValueIgnoreCaseAndDataEndStatus(Long codeId, String value, String dataEndStatus);
    boolean existsByCodeIdAndValueIgnoreCaseAndIdNot(Long codeId, String value, Long id);
}
