package com.vision.repository;

import com.vision.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Event Repository
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCameraId(Long cameraId);

    Page<Event> findByCameraId(Long cameraId, Pageable pageable);

    List<Event> findBySeverity(String severity);

    List<Event> findByEventTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    Page<Event> findByEventTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

}
