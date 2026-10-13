package com.vision.repository;

import com.vision.entity.MetadataQuery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MetadataQueryRepository extends JpaRepository<MetadataQuery, Long> {
    boolean existsByQueryCode(String queryCode);
    Optional<MetadataQuery> findByQueryCodeAndDataEndStatus(String queryCode, String dataEndStatus);
}
