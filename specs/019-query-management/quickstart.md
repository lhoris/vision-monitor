# Query 관리 검증 가이드

## 사전 조건

- DB가 실행 중이고 Flyway가 기존 `TB_M26_METADATA_QUERY`를 생성한 상태
- backend와 frontend가 로컬 개발 방식으로 실행된 상태
- 관리자 계정으로 로그인한 상태

## 수동 검증

1. 관리자 메뉴에서 Query 관리 화면에 진입한다.
2. 기존 Query 목록에서 활성·비활성 필터와 Query ID 검색을 확인한다.
3. `camera.test-status`와 유효한 `SELECT` Query를 등록한다.
4. 화면 확대 보기 메타데이터 섹션의 Query 선택 목록에서 새 Query가 보이는지 확인한다.
5. 동일 Query ID를 다시 등록해 중복 오류가 표시되는지 확인한다.
6. `UPDATE`, 다중 문장 또는 `DROP`이 포함된 SQL 저장이 거부되는지 확인한다.
7. Query를 비활성화하고 신규 섹션의 Query 선택 목록에서 제외되는지 확인한다.
8. 참조 중인 Query 삭제를 요청하고 공통 확인 모달 및 참조 중 오류가 표시되는지 확인한다.
9. 참조가 없는 Query 삭제 후 기본 목록과 선택 목록에서 제외되는지 확인한다.

## 자동 검증

- Backend: Query 서비스·컨트롤러 테스트와 `mvn test`
- Frontend: Query 관리 서비스·화면 테스트와 `npm test`
- Build: `mvn package -DskipTests` 및 `npm run build`
