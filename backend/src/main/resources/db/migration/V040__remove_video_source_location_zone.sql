-- 영상 소스 관리에서 더 이상 관리하지 않는 위치/구역 컬럼 제거
ALTER TABLE TB_M26_VIDEO_SOURCE
    DROP COLUMN LOCATION,
    DROP COLUMN ZONE_NAME;

-- 화면 확대 보기의 기본 영상 정보에서 제거된 컬럼을 참조하지 않도록 갱신
UPDATE TB_M26_METADATA_QUERY
SET SQL_TEXT = 'SELECT ''Video Name'' AS label, VIDEO_NAME AS value FROM TB_M26_VIDEO_SOURCE WHERE VIDEO_SOURCE_ID = :sourceId AND DATA_END_STATUS = ''N''',
    QUERY_DESCRIPTION = 'Video source name for the focus view'
WHERE QUERY_CODE = 'camera.info'
  AND DATA_END_STATUS = 'N';
