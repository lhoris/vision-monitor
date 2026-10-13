package com.vision.repository;

import com.vision.entity.ModelProcess;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ModelProcessRepository extends JpaRepository<ModelProcess, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ModelProcess p where p.id = :id and p.dataEndStatus = 'N'")
    Optional<ModelProcess> findActiveForUpdate(@Param("id") Long id);
}
