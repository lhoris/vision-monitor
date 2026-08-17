# 데이터 모델: 사용자 관리

## UserAccount

사용자관리 그리드와 상세 화면의 중심 엔티티다.

| 필드 | 설명 | 검증/규칙 |
|------|------|-----------|
| `id` | 시스템 내부 사용자 식별자 | 필수, 변경 불가 |
| `username` | 로그인 사용자 ID | 필수, 중복 불가 |
| `name` | 사용자 이름 | 필수 |
| `displayName` | 화면 표시명 | 선택, 없으면 이름 사용 |
| `department` | 부서/소속 | 선택 |
| `position` | 직책 | 선택 |
| `email` | 이메일 | 선택, 입력 시 이메일 형식 |
| `phone` | 연락처 | 선택 |
| `roles` | 배정된 역할 목록 | 하나 이상 권장, 관리자 계정 보호 규칙 적용 |
| `accountStatus` | 계정 상태 | `active`, `locked`, `disabled` |
| `employmentStatus` | 재직 상태 | `employed`, `leave`, `retired` |
| `lastLoginAt` | 마지막 접속 시각 | 표시용 |
| `createdAt` | 생성 시각 | 표시용 |
| `createdBy` | 생성자 | 표시용 |
| `updatedAt` | 최근 수정 시각 | 표시용 |
| `updatedBy` | 최근 수정자 | 표시용 |
| `personalization` | 개인화 설정 요약 | UserPersonalizationSummary 참조 |

## RoleSummary

사용자에게 배정 가능한 역할의 요약 정보다.

| 필드 | 설명 | 검증/규칙 |
|------|------|-----------|
| `id` | 역할 식별자 | 필수 |
| `name` | 역할명 | 필수 |
| `description` | 역할 설명 | 선택 |
| `isAdminRole` | 관리자 권한 역할 여부 | 마지막 관리자 보호에 사용 |
| `isActive` | 역할 사용 여부 | 비활성 역할은 신규 배정 제한 |

## UserPersonalizationSummary

사용자의 개인화 설정 보유 상태와 처리 가능 여부를 표현한다.

| 필드 | 설명 | 검증/규칙 |
|------|------|-----------|
| `hasGridLayout` | 영상그리드 개인화 보유 여부 | 표시용 |
| `layoutCount` | 개인화 layout 수 | 0 이상 |
| `canReset` | 초기화 가능 여부 | 퇴사/삭제 요청 시 선택지 표시 |
| `lastUpdatedAt` | 마지막 개인화 수정 시각 | 표시용 |

## UserManagementFilters

그리드 검색/필터 조건이다.

| 필드 | 설명 |
|------|------|
| `query` | 사용자 ID, 이름, 표시명 검색어 |
| `department` | 부서/소속 필터 |
| `roleId` | 역할 필터 |
| `accountStatus` | 계정 상태 필터 |
| `employmentStatus` | 재직 상태 필터 |

## UserMutationRequest

사용자 추가/수정 요청의 공통 입력 모델이다.

| 필드 | 설명 | 검증/규칙 |
|------|------|-----------|
| `username` | 사용자 ID | 필수, 중복 불가 |
| `name` | 이름 | 필수 |
| `displayName` | 표시명 | 선택 |
| `department` | 부서/소속 | 선택 |
| `position` | 직책 | 선택 |
| `email` | 이메일 | 선택, 형식 검증 |
| `phone` | 연락처 | 선택 |
| `roleIds` | 역할 ID 목록 | 하나 이상 권장 |
| `accountStatus` | 계정 상태 | 필수 |
| `employmentStatus` | 재직 상태 | 필수 |

## UserDangerAction

위험 변경 요청을 표현한다.

| 값 | 설명 | 보호 규칙 |
|----|------|-----------|
| `disable` | 계정 비활성화 | 자기 계정/마지막 관리자 보호 |
| `retire` | 퇴사 처리 | 개인화 유지/초기화 선택 |
| `deleteRequest` | 삭제 요청 | 비활성/퇴사 우선 안내, 마지막 관리자 보호 |
| `resetPersonalization` | 개인화 초기화 | 개인화 보유 사용자만 가능 |

## 상태 전이

### AccountStatus

```text
active -> locked
active -> disabled
locked -> active
locked -> disabled
disabled -> active
```

### EmploymentStatus

```text
employed -> leave
employed -> retired
leave -> employed
leave -> retired
```

### 보호 규칙

- 현재 로그인한 관리자 자기 계정은 비활성화, 삭제 요청, 관리자 역할 제거 전에 경고 또는 차단한다.
- 변경 후 관리자 역할을 가진 활성 사용자가 0명이 되면 저장을 차단한다.
- 퇴사 또는 삭제 요청 대상에게 개인화 설정이 있으면 유지/초기화 선택을 표시한다.
