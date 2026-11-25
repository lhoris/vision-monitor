package com.vision.repository;

import com.vision.entity.AlarmRuleUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlarmRuleUserRepository extends JpaRepository<AlarmRuleUser, Long> {
    List<AlarmRuleUser> findAllByAlarmRuleIdIn(List<Long> alarmRuleIds);
    Optional<AlarmRuleUser> findByAlarmRuleIdAndUserId(Long alarmRuleId, Long userId);
    void deleteAllByUserId(Long userId);
}
