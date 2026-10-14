package com.vision.repository;

import com.vision.entity.ModelEventLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModelEventLogRepository extends JpaRepository<ModelEventLog, Long> {
}
