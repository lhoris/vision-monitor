# 데이터 모델: 화면 단계별 온보딩 안내 기능

이번 기능은 서버 데이터 모델이나 DB 스키마를 추가하지 않는다.

## 클라이언트 모델

### OnboardingContext

| 필드 | 타입 | 설명 |
|---|---|---|
| `screen` | `'login' \| 'live' \| 'unsupported'` | 현재 화면의 온보딩 지원 여부 |
| `tourId` | `string \| null` | 실행할 투어 식별자 |
| `language` | `'ko' \| 'en'` | 현재 i18n 언어 |

### TourStepDefinition

| 필드 | 타입 | 설명 |
|---|---|---|
| `element` | `string` | 강조할 DOM 요소의 안정적인 selector |
| `title` | `string` | 단계 제목의 번역 키 |
| `description` | `string` | 단계 설명의 번역 키 |
| `order` | `number` | 표시 순서 |

## 상태 전이

`idle → running → completed` 또는 `idle → running → skipped`로 관리한다. 사용자가 화면을 이동하거나 로그아웃하면 `running → terminated`로 정리한다.

초기 구현에서는 상태를 서버에 저장하지 않으며, 수동 재실행을 허용한다.
