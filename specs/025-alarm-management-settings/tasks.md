# 작업 목록: 통합 알람 관리

## 데이터 및 백엔드

- [X] `TB_M26_ALARM_RULE` 전용 테이블과 기존 데이터 이관·정리 migration 추가
- [X] `AlarmRule` 엔티티 및 `AlarmRuleRepository` 구현
- [X] 알람 관리 서비스의 유형 정책 조회·수정을 `AlarmRule` 기반으로 전환
- [X] 회원가입 알람 정책 조회를 `AlarmRule` 기반으로 전환
- [X] 알람 공동 확인 범위 조회를 `AlarmRule` 기반으로 전환
- [X] `TB_M26_CODE_DETAIL` 및 `CodeDetail`의 알람 정책 컬럼 제거

## 관리 화면 및 검증

- [X] 알람 관리 API와 사용자별 수신·채널 예외 설정 연결
- [X] 공동 확인 알람의 `ALARM_GROUP_ID` 처리
- [X] 백엔드 컴파일·관련 테스트·프론트엔드 빌드 검증
- [X] 설계서의 테이블 구조와 실제 구현 동기화
