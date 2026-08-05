package com.vision.repository;

import com.vision.entity.Recording;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Recording Repository
 */
@Repository
public interface RecordingRepository extends JpaRepository<Recording, Long> {

    List<Recording> findByCameraId(Long cameraId);

    Page<Recording> findByCameraId(Long cameraId, Pageable pageable);

    List<Recording> findByStatus(String status);

    List<Recording> findByStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    Page<Recording> findByStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

}
