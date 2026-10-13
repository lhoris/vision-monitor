-- 모델 등록 시 Agent가 아직 등록되지 않은 상태를 허용한다.
-- Agent가 등록되고 프로세스가 동기화되면 AGENT_ID가 채워진다.
ALTER TABLE TB_M26_MODEL_PROCESS
    MODIFY COLUMN AGENT_ID VARCHAR(64) NULL COMMENT '프로세스를 담당하는 Runtime Agent 식별자';
