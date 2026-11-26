package com.vision.repository;

import com.vision.entity.AlarmLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlarmLogRepository extends JpaRepository<AlarmLog, Long> {
    List<AlarmLog> findByTargetUserIdAndAcknowledgedStatusAndDataEndStatusOrderByOccurredTimestampDesc(
            Long targetUserId, String acknowledgedStatus, String dataEndStatus);

    List<AlarmLog> findByTargetUserIdAndDataEndStatusOrderByOccurredTimestampDesc(
            Long targetUserId, String dataEndStatus);

    Optional<AlarmLog> findByIdAndTargetUserIdAndDataEndStatus(Long id, Long targetUserId, String dataEndStatus);

    List<AlarmLog> findAllByAlarmGroupIdAndDataEndStatus(String alarmGroupId, String dataEndStatus);

    void deleteAllByTargetUserId(Long targetUserId);

    boolean existsBySourceEventIdAndTargetUserId(String sourceEventId, Long targetUserId);

    boolean existsByAlarmRequestId(Long alarmRequestId);

    boolean existsByAlarmRequestIdAndTargetUserId(Long alarmRequestId, Long targetUserId);

    List<AlarmLog> findTop100ByAppStatusOrderByIdAsc(String status);

    List<AlarmLog> findTop100ByEmailStatusOrderByIdAsc(String status);

    List<AlarmLog> findTop100ByTeamsStatusOrderByIdAsc(String status);

    @Modifying
    @Query("update AlarmLog a set a.appStatus = 'PROCESSING' where a.id = :id and a.appStatus = 'PENDING'")
    int claimApp(@Param("id") Long id);

    @Modifying
    @Query("update AlarmLog a set a.emailStatus = 'PROCESSING' where a.id = :id and a.emailStatus = 'PENDING'")
    int claimEmail(@Param("id") Long id);

    @Modifying
    @Query("update AlarmLog a set a.teamsStatus = 'PROCESSING' where a.id = :id and a.teamsStatus = 'PENDING'")
    int claimTeams(@Param("id") Long id);

    @Modifying
    @Query("update AlarmLog a set a.appStatus = 'SENT' where a.id = :id and a.appStatus = 'PROCESSING'")
    int markAppSent(@Param("id") Long id);

    @Modifying
    @Query("update AlarmLog a set a.appStatus = 'FAILED' where a.id = :id and a.appStatus = 'PROCESSING'")
    int markAppFailed(@Param("id") Long id);

    @Modifying
    @Query("update AlarmLog a set a.emailStatus = 'FAILED' where a.id = :id and a.emailStatus = 'PROCESSING'")
    int markEmailFailed(@Param("id") Long id);

    @Modifying
    @Query("update AlarmLog a set a.emailStatus = 'SENT' where a.id = :id and a.emailStatus = 'PROCESSING'")
    int markEmailSent(@Param("id") Long id);

    @Modifying
    @Query("update AlarmLog a set a.teamsStatus = 'FAILED' where a.id = :id and a.teamsStatus = 'PROCESSING'")
    int markTeamsFailed(@Param("id") Long id);
}
