package com.vision.repository;

import com.vision.entity.Camera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Camera Repository
 */
@Repository
public interface CameraRepository extends JpaRepository<Camera, Long> {

    List<Camera> findByZone(String zone);

    List<Camera> findByStatus(String status);

    Optional<Camera> findByName(String name);

}
