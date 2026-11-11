package com.vision.repository;

import com.vision.entity.AlarmRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlarmRuleRepository extends JpaRepository<AlarmRule, Long> {
    List<AlarmRule> findAllByDataEndStatusOrderByIdAsc(String dataEndStatus);
    Optional<AlarmRule> findByCodeIgnoreCaseAndDataEndStatus(String code, String dataEndStatus);
}
