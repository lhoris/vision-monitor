package com.vision.repository;

import com.vision.entity.ModelProcess;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface ModelProcessRepository extends JpaRepository<ModelProcess, Long>, ModelProcessQueryRepository {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ModelProcess> findByIdAndDataEndStatus(Long id, String dataEndStatus);
}
