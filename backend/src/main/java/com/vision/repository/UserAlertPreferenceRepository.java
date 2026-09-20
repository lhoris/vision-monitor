package com.vision.repository;

import com.vision.entity.UserAlertPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAlertPreferenceRepository extends JpaRepository<UserAlertPreference, Long> {
    Optional<UserAlertPreference> findByUserId(Long userId);
}
