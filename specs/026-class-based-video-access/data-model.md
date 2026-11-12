# 데이터 모델

## 공통코드

- 코드명: `USER_CLASS`
- 상세값: `HEATING`, `ROLLING`, `COOLING`, `TEST`, `EQUIPMENT`, `COMMON`

## `TB_M26_USER`

| 컬럼 | 설명 |
|---|---|
| `CLASS_CODE` | 사용자의 반 공통코드. 기본값 `COMMON` |

## `TB_M26_VIDEO_SOURCE`

| 컬럼 | 설명 |
|---|---|
| `CLASS_CODE` | 영상 소스의 반 공통코드. 기존 데이터는 `COMMON` |

## 조회 규칙

- 사용자 `COMMON`: 모든 활성 영상
- 그 외 사용자: `CLASS_CODE`가 사용자 반 또는 `COMMON`인 활성 영상
- 관리용 전체 영상 조회는 관리자 화면에서 기존처럼 전체 목록을 유지한다.
