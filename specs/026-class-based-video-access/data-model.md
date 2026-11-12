# 데이터 모델

## 공통코드

- 코드명: `USER_CLASS`
- 상세값: `HEATING`, `ROLLING`, `COOLING`, `TEST`, `EQUIPMENT`

## `TB_M26_USER`

| 컬럼 | 설명 |
|---|---|
| `CLASS_CODE` | 사용자의 선택 반. NULL이면 전체 영상 조회 |

## `TB_M26_VIDEO_SOURCE`

| 컬럼 | 설명 |
|---|---|
| `CLASS_CODE` | 영상 소스의 선택 반. NULL이면 전체 사용자에게 노출 |

## 조회 규칙

- 사용자 반 NULL: 모든 활성 영상
- 사용자 반 지정: 사용자 반 또는 반 NULL인 활성 영상
- 관리용 전체 영상 조회는 관리자 화면에서 기존처럼 전체 목록을 유지한다.
