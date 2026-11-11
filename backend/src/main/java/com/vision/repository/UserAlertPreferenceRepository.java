package com.vision.repository;

import com.vision.entity.UserAlertPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserAlertPreferenceRepository extends JpaRepository<UserAlertPreference, Long> {
    Optional<UserAlertPreference> findByUserId(Long userId);
    Optional<UserAlertPreference> findByUserIdAndAlarmTypeCode(Long userId, String alarmTypeCode);
    List<UserAlertPreference> findAllByAlarmTypeCodeIn(List<String> alarmTypeCodes);
}
