-- 기존 설치 DB에서 자동 증가 설정이 누락된 경우를 보정한다.
-- 기존 데이터는 유지하고 신규 모델 등록 시 ID가 자동 발급되도록 정렬한다.
ALTER TABLE TB_M26_MODEL_PROCESS
    MODIFY COLUMN MODEL_PROCESS_ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;
