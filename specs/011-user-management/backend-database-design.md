# 사용자 관리 backend 데이터베이스 설계

## 1. 목적

사용자관리 화면의 mock 계약을 실제 MariaDB 저장 구조와 backend API로 확장하기 위한 데이터베이스 설계다.

이번 1차 범위에서는 사용자와 조직 계층을 다음 두 테이블로 관리한다.

- `users`: 로그인 계정과 사용자 기본 정보
- `org_units`: 소속, 부서, 섹션을 표현하는 조직 계층

역할, 권한 정책, 감사 이력, 개인화 상세 데이터는 기존 테이블 또는 후속 기능의 책임으로 둔다.

## 2. 조직 모델

`org_units`는 `parent_id` 자기 참조로 계층을 표현한다.

```text
SITE
└── DEPARTMENT
    └── SECTION
```

`unit_type`은 현재 `SITE`, `DEPARTMENT`, `SECTION`을 사용한다. 향후 조직 단계가 추가되더라도 테이블 구조는 변경하지 않는다.

| 컬럼 | 타입 | 규칙 |
|---|---|---|
| `id` | `BIGINT` | 내부 식별자 |
| `parent_id` | `BIGINT NULL` | 상위 조직. 최상위 조직은 null |
| `unit_type` | `VARCHAR(30)` | 조직 단계 |
| `code` | `VARCHAR(100)` | 전역 중복 불가 |
| `name` | `VARCHAR(255)` | 표시명 |
| `active` | `BOOLEAN` | 비활성 조직은 신규 소속 지정 불가 |
| `sort_order` | `INT` | 동일 부모 아래 표시 순서 |
| `created_at` | `DATETIME` | 생성 시각 |
| `updated_at` | `DATETIME` | 수정 시각 |

## 3. 사용자와 조직 연결

1차 범위에서는 사용자당 주 소속 조직 하나를 허용한다.

```text
users.org_unit_id -> org_units.id
```

현재 `org_unit_id`는 기존 데이터 호환을 위해 nullable이다. 운영 데이터 정비가 끝난 뒤 필수 여부를 별도 migration으로 결정한다.

DB 외래키는 생성하지 않는다. backend가 다음 규칙을 저장 전 검증한다.

- `org_unit_id`가 존재하는지 확인
- 대상 조직이 active인지 확인
- 조직의 부모 계층이 유효한지 확인
- 비활성 조직으로 사용자를 이동하지 못하게 처리
- 조직 비활성화 시 해당 조직과 하위 조직의 사용자 영향 확인

## 4. 물리 제약 정책

- 외래키를 생성하지 않는다.
- `org_units.parent_id`와 `users.org_unit_id`에는 조회용 인덱스를 둔다.
- `org_units.code`는 unique 제약으로 중복을 방지한다.
- 사용자-조직 참조 무결성은 backend service와 테스트로 보장한다.
- 조직 삭제는 기본적으로 허용하지 않고 비활성화를 우선한다.

## 5. Migration

현재 migration 순서는 다음과 같다.

- `V001__init.sql`: 기존 `users` 테이블 포함 초기 스키마
- `V002__add_user_layouts.sql`: 사용자 개인화 layout 테이블
- `V003__add_organization_units.sql`: `org_units` 생성 및 `users.org_unit_id` 추가

`V003`은 기존 사용자 데이터가 존재할 수 있으므로 `org_unit_id`를 nullable로 추가한다.

## 6. 현재 범위에서 미정인 항목

- 사용자에게 조직을 하나만 부여할지, 겸직을 위해 여러 조직을 허용할지
- 조직 코드의 변경 허용 여부
- 조직을 물리 삭제할지, 항상 비활성화할지
- 조직 변경 이력을 별도 보존할지
- 사용자 등록 시 초기 비밀번호를 직접 입력할지, 초대/임시 비밀번호를 사용할지

위 항목은 인증·인사 운영 정책 확정 후 별도 migration과 API 계약으로 결정한다.
