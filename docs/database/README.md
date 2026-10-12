# 데이터베이스 운영 절차

이 프로젝트는 애플리케이션 시작 시 데이터베이스 DDL을 자동 변경하지 않습니다.
Spring Boot는 `ddl-auto: none`으로 실행되며, 스키마 변경은 DBA 또는 배포 담당자가 SQL을 검토한 뒤 수동 적용합니다.

## 모델 프로세스 테이블 변경

1. 대상 DB를 백업합니다.
2. [backup_m26_model_process.sql](./backup_m26_model_process.sql)을 실행하고 원본/백업 건수를 확인합니다.
3. [recreate_m26_model_process.sql](./recreate_m26_model_process.sql)을 검토한 뒤 실행합니다.
4. 복원 건수와 `MODEL_PROCESS_ID`를 사용하는 이벤트/명령 데이터를 확인합니다.

DDL은 자동 롤백되지 않으므로 운영 DB에서는 사전 백업과 검증 결과를 반드시 남깁니다.

## 기존 SQL

`backend/src/main/resources/db/migration`의 기존 `Vxxx__*.sql` 파일은 과거 적용 이력 보관용입니다.
애플리케이션은 해당 파일을 자동 실행하지 않으며, 신규 변경은 이 디렉터리에 추가하지 않습니다.
