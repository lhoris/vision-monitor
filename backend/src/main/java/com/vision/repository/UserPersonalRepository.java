package com.vision.repository;

import com.vision.entity.UserPersonal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPersonalRepository extends JpaRepository<UserPersonal, Long> {

    List<UserPersonal> findAllByUserIdAndDataEndStatusOrderBySortOrderAsc(Long userId, String dataEndStatus);
}
