-- 모델 이벤트 로그 식별자 보정
--
-- 대상: TB_M26_MODEL_EVENT_LOG
-- 증상: 모델 삭제/등록 시 MODEL_EVENT_LOG_ID doesn't have a default value
-- 원인: 기존 테이블의 MODEL_EVENT_LOG_ID가 AUTO_INCREMENT 없이 생성됨
--
-- 이 프로젝트는 Flyway를 사용하지 않으므로, 이미 생성된 DB에 1회 실행한다.
-- 기존 데이터는 유지되며, 현재 최대 ID 다음 값부터 자동 증가한다.

ALTER TABLE TB_M26_MODEL_EVENT_LOG
    MODIFY COLUMN MODEL_EVENT_LOG_ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT
    COMMENT '모델 이벤트 로그 ID';
