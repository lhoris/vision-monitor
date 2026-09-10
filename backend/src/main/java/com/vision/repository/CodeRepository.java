package com.vision.repository;

import com.vision.entity.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CodeRepository extends JpaRepository<Code, Long> {
    List<Code> findAllByDataEndStatusOrderByNameAsc(String dataEndStatus);
    List<Code> findAllByOrderByNameAsc();
    Optional<Code> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
