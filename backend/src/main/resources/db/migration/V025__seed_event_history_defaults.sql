INSERT INTO TB_M26_EVENT_HISTORY (
    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
    CAMERA_ID, EVENT_TYPE, SEVERITY, DESCRIPTION, OCCURRED_TIMESTAMP,
    ACKNOWLEDGED_STATUS, METADATA_JSON
)
SELECT 'S', 'SYSTEM', 'V025_SEED', 'S', 'SYSTEM', 'V025_SEED',
       seed.CAMERA_ID, seed.EVENT_TYPE, seed.SEVERITY, seed.DESCRIPTION,
       seed.OCCURRED_TIMESTAMP, seed.ACKNOWLEDGED_STATUS, seed.METADATA_JSON
FROM (
    SELECT 1 CAMERA_ID, 'COIL_COOLING_TEMPERATURE_HIGH' EVENT_TYPE, 'CRITICAL' SEVERITY,
           '코일 공냉대 온도 상승으로 인해 롤링 속도 조정이 필요합니다.' DESCRIPTION,
           '2026-10-08 08:10:00' OCCURRED_TIMESTAMP, 'N' ACKNOWLEDGED_STATUS,
           '{"coilId":"C2601001","temperature":"865C","limit":"820C"}' METADATA_JSON
    UNION ALL SELECT 2, 'COIL_SURFACE_DEFECT_DETECTED', 'WARNING',
           '압연 공정에서 코일 표면 결함이 감지되었습니다.', '2026-10-08 08:06:00', 'N',
           '{"coilId":"C2601002","defect":"surface crack","confidence":"0.94"}'
    UNION ALL SELECT 3, 'ENTRY_ZONE_MATERIAL_JAM', 'CRITICAL',
           '공냉대 Entry Zone에서 소재 정체가 감지되었습니다.', '2026-10-08 07:58:00', 'N',
           '{"line":"Entry Zone","durationSec":"18"}'
    UNION ALL SELECT 4, 'MODEL_HEARTBEAT_MISSED', 'WARNING',
           '선재 표면 검사 AI 모델의 heartbeat가 일정 시간 수신되지 않았습니다.', '2026-10-08 07:42:00', 'Y',
           '{"model":"Wire Surface Detector","lastSeen":"2026-10-08T07:36:00Z"}'
    UNION ALL SELECT 5, 'CONTROL_INTEGRATION_FAILED', 'ERROR',
           '압연 속도 제어 연동 호출에 실패했습니다.', '2026-10-08 07:30:00', 'N',
           '{"target":"rolling-speed-controller","error":"connection timeout"}'
    UNION ALL SELECT 6, 'COIL_CENTERING_OUT_OF_RANGE', 'INFO',
           '코일 센터링 편차가 허용 범위로 복귀했습니다.', '2026-10-08 07:18:00', 'Y',
           '{"deviationMm":"1.2","limitMm":"2.0"}'
) seed
WHERE NOT EXISTS (
    SELECT 1 FROM TB_M26_EVENT_HISTORY e
    WHERE e.CAMERA_ID = seed.CAMERA_ID
      AND e.EVENT_TYPE = seed.EVENT_TYPE
      AND e.OCCURRED_TIMESTAMP = seed.OCCURRED_TIMESTAMP
      AND e.DATA_END_STATUS = 'N'
);
