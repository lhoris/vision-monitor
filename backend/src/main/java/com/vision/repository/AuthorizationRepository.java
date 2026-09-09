package com.vision.repository;

import com.vision.entity.Authorization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthorizationRepository extends JpaRepository<Authorization, Long> {

    Optional<Authorization> findByCodeIgnoreCaseAndDataEndStatus(String code, String dataEndStatus);
}
