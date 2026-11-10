package com.vision.dto;

import com.vision.entity.AlarmLog;

import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;

/** Alarm log payload shared by the notification bell and alarm list. */
public record AlarmLogDto(
        Long id,
        Long cameraId,
        Long modelProcessId,
        String type,
        String severity,
        String description,
        String timestamp,
        boolean acknowledged,
        Map<String, Object> metadata
) {
    public static AlarmLogDto from(AlarmLog alarmLog) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        if (alarmLog.getContext() != null && !alarmLog.getContext().isBlank()) {
            for (String entry : alarmLog.getContext().split(";")) {
                String[] pair = entry.split("=", 2);
                if (pair.length == 2) metadata.put(pair[0], pair[1]);
            }
        }
        metadata.put("sourceType", alarmLog.getSourceType());
        metadata.put("sourceId", alarmLog.getSourceId());
        return new AlarmLogDto(
                alarmLog.getId(),
                0L,
                null,
                alarmLog.getAlarmType(),
                alarmLog.getSeverity(),
                alarmLog.getMessage(),
                alarmLog.getOccurredTimestamp().toInstant(ZoneOffset.UTC).toString(),
                "Y".equalsIgnoreCase(alarmLog.getAcknowledgedStatus()),
                metadata
        );
    }
}
