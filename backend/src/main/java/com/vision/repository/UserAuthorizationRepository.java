package com.vision.repository;

import com.vision.entity.UserAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAuthorizationRepository extends JpaRepository<UserAuthorization, Long> {

    List<UserAuthorization> findAllByUserIdAndDataEndStatus(Long userId, String dataEndStatus);
}
