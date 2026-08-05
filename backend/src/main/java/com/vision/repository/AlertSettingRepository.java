package com.vision.repository;

import com.vision.entity.AlertSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Alert Setting Repository
 */
@Repository
public interface AlertSettingRepository extends JpaRepository<AlertSetting, Long> {

    List<AlertSetting> findByCameraId(Long cameraId);

    List<AlertSetting> findByCameraIdAndEnabled(Long cameraId, Boolean enabled);

    List<AlertSetting> findByEventType(String eventType);

}
