-- Seed local WebRTC/WHEP sample video sources when they are not already present.
INSERT INTO TB_M26_VIDEO_SOURCE (
    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
    VIDEO_NAME, VIDEO_URL, VIDEO_PROTOCOL, LOCATION, ZONE_NAME, STATUS, REMARKS
)
SELECT
    'S', 'SYSTEM', 'V007_SEED',
    'S', 'SYSTEM', 'V007_SEED',
    seed.VIDEO_NAME,
    seed.VIDEO_URL,
    'WEBRTC',
    NULL,
    NULL,
    'ACTIVE',
    'Local WebRTC WHEP sample source'
FROM (
    SELECT 'sample001' AS VIDEO_NAME, 'http://localhost:8889/sample001/whep' AS VIDEO_URL
    UNION ALL SELECT 'sample002', 'http://localhost:8889/sample002/whep'
    UNION ALL SELECT 'sample003', 'http://localhost:8889/sample003/whep'
    UNION ALL SELECT 'sample004', 'http://localhost:8889/sample004/whep'
    UNION ALL SELECT 'sample005', 'http://localhost:8889/sample005/whep'
    UNION ALL SELECT 'sample006', 'http://localhost:8889/sample006/whep'
    UNION ALL SELECT 'sample007', 'http://localhost:8889/sample007/whep'
    UNION ALL SELECT 'sample008', 'http://localhost:8889/sample008/whep'
    UNION ALL SELECT 'sample009', 'http://localhost:8889/sample009/whep'
) seed
WHERE NOT EXISTS (
    SELECT 1
    FROM TB_M26_VIDEO_SOURCE existing
    WHERE LOWER(existing.VIDEO_URL) = LOWER(seed.VIDEO_URL)
);
