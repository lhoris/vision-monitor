package com.vision.repository;

import com.vision.entity.AlarmRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlarmRequestRepository extends JpaRepository<AlarmRequest, Long> {
    Optional<AlarmRequest> findBySourceEventId(String sourceEventId);
    List<AlarmRequest> findTop100ByOrderByIdAsc();
}
