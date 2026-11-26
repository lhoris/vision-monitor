package com.vision.dto;

import com.vision.entity.AlarmLog;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static AlarmLogDto from(AlarmLog alarmLog) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        if (alarmLog.getContext() != null && !alarmLog.getContext().isBlank()) {
            try {
                metadata.putAll(OBJECT_MAPPER.readValue(alarmLog.getContext(), new TypeReference<Map<String, Object>>() { }));
            } catch (Exception ignored) {
                for (String entry : alarmLog.getContext().split(";")) {
                    String[] pair = entry.split("=", 2);
                    if (pair.length == 2) metadata.put(pair[0], pair[1]);
                }
            }
        }
        Long modelProcessId = parseLongValue(metadata.get("modelProcessId"));
        Long cameraId = parseLongValue(metadata.get("cameraId"));
        return new AlarmLogDto(
                alarmLog.getId(),
                cameraId == null ? 0L : cameraId,
                modelProcessId,
                alarmLog.getAlarmType(),
                alarmLog.getSeverity(),
                alarmLog.getMessage(),
                alarmLog.getOccurredTimestamp().toInstant(ZoneOffset.UTC).toString(),
                "Y".equalsIgnoreCase(alarmLog.getAcknowledgedStatus()),
                metadata
        );
    }

    private static Long parseLongValue(Object value) {
        if (value == null) return null;
        try { return Long.valueOf(String.valueOf(value)); }
        catch (NumberFormatException ignored) { return null; }
    }
}
