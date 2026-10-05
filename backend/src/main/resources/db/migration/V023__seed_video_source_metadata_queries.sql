INSERT INTO TB_M26_METADATA_QUERY (
    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
    QUERY_CODE, QUERY_NAME, QUERY_DESCRIPTION, SQL_TEXT, RESULT_SCHEMA,
    QUERY_TIMEOUT_SEC, USE_STATUS, DATA_END_STATUS
)
SELECT 'S', 'SYSTEM', 'MIGRATION', 'S', 'SYSTEM', 'MIGRATION',
       'camera.info', 'Video Source Information', 'Video source information for the focus view',
       'SELECT ''Video Name'' AS label, VIDEO_NAME AS value FROM TB_M26_VIDEO_SOURCE WHERE VIDEO_SOURCE_ID = :sourceId AND DATA_END_STATUS = ''N'' UNION ALL SELECT ''Location'' AS label, LOCATION AS value FROM TB_M26_VIDEO_SOURCE WHERE VIDEO_SOURCE_ID = :sourceId AND DATA_END_STATUS = ''N'' UNION ALL SELECT ''Zone'' AS label, ZONE_NAME AS value FROM TB_M26_VIDEO_SOURCE WHERE VIDEO_SOURCE_ID = :sourceId AND DATA_END_STATUS = ''N''',
       '[{"name":"label","label":"Label","type":"string"},{"name":"value","label":"Value","type":"string"}]',
       5, 'Y', 'N'
WHERE NOT EXISTS (SELECT 1 FROM TB_M26_METADATA_QUERY WHERE QUERY_CODE = 'camera.info');

INSERT INTO TB_M26_METADATA_QUERY (
    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
    QUERY_CODE, QUERY_NAME, QUERY_DESCRIPTION, SQL_TEXT, RESULT_SCHEMA,
    QUERY_TIMEOUT_SEC, USE_STATUS, DATA_END_STATUS
)
SELECT 'S', 'SYSTEM', 'MIGRATION', 'S', 'SYSTEM', 'MIGRATION',
       'camera.status', 'Video Source Status', 'Current video source status for the focus view',
       'SELECT ''Status'' AS label, STATUS AS value FROM TB_M26_VIDEO_SOURCE WHERE VIDEO_SOURCE_ID = :sourceId AND DATA_END_STATUS = ''N''',
       '[{"name":"label","label":"Label","type":"string"},{"name":"value","label":"Value","type":"string"}]',
       5, 'Y', 'N'
WHERE NOT EXISTS (SELECT 1 FROM TB_M26_METADATA_QUERY WHERE QUERY_CODE = 'camera.status');

UPDATE TB_M26_METADATA_QUERY
SET SQL_TEXT = 'SELECT NULL AS eventId, NULL AS title WHERE 1 = 0',
    QUERY_DESCRIPTION = 'Recent events are unavailable until the event history table is connected',
    RESULT_SCHEMA = '[{"name":"eventId","label":"Event ID","type":"number"},{"name":"title","label":"Title","type":"string"}]'
WHERE QUERY_CODE = 'camera.recent-events' AND DATA_END_STATUS = 'N';
