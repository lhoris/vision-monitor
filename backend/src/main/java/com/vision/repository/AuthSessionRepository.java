package com.vision.repository;

import com.vision.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {
    Optional<AuthSession> findByTokenHashAndDataEndStatusAndRevokedTimestampIsNullAndExpiresTimestampAfter(
            String tokenHash,
            String dataEndStatus,
            LocalDateTime now
    );

    Optional<AuthSession> findByTokenHashAndDataEndStatusAndRevokedTimestampIsNull(
            String tokenHash,
            String dataEndStatus
    );
}
