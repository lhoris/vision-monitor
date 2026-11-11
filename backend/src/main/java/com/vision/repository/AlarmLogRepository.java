package com.vision.repository;

import com.vision.entity.AlarmLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlarmLogRepository extends JpaRepository<AlarmLog, Long> {
    List<AlarmLog> findByTargetUserIdAndAcknowledgedStatusAndDataEndStatusOrderByOccurredTimestampDesc(
            Long targetUserId, String acknowledgedStatus, String dataEndStatus);

    Optional<AlarmLog> findByIdAndTargetUserIdAndDataEndStatus(Long id, Long targetUserId, String dataEndStatus);

    List<AlarmLog> findAllByAlarmGroupIdAndDataEndStatus(String alarmGroupId, String dataEndStatus);
}
