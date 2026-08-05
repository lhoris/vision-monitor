package com.vision.repository;

import com.vision.entity.Stream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Stream Repository
 */
@Repository
public interface StreamRepository extends JpaRepository<Stream, Long> {

    List<Stream> findByCameraId(Long cameraId);

    List<Stream> findByStatus(String status);

}
