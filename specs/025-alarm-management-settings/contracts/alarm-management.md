# 알람 관리 API 계약

- `GET /api/admin/alarm-management`: 알람 유형 정책과 사용자별 예외를 반환한다.
- `PUT /api/admin/alarm-management/types/{detailId}`: 유형 기본 정책을 저장한다.
- `PUT /api/admin/alarm-management/users/{userId}`: 사용자별 유형 수신자·채널 예외를 저장한다.

모든 API는 관리자 세션이 필요하다. 유형 정책은 `defaultSave`, `recipientScope`, `acknowledgementScope`, `defaultPush`, `defaultEmail`, `defaultTeams`를 포함한다. 사용자 예외는 `receiver`, `push`, `email`, `teams`를 포함한다.
