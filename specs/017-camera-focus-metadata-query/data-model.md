# 데이터 모델: 영상소스별 Query 기반 메타데이터

## MetadataLayoutProfile

영상소스 하나에 대한 사용자별 메타데이터 설정이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `userId` | `string` | 설정 소유 사용자 식별자 |
| `sourceId` | `string` | 영상소스 식별자 |
| `sections` | `MetadataSectionConfig[]` | 표시할 섹션 목록 |
| `updatedAt` | `string` | ISO-8601 갱신 시각 |

식별자는 `(userId, sourceId)` 복합키다. `sections`가 빈 배열이면 빈 상태를 표시하되, 기본 설정 복원 기능으로 source profile을 다시 구성할 수 있다.

## MetadataSectionConfig

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | `string` | 프로필 안에서 고유한 섹션 ID |
| `title` | `string` | 화면에 표시할 섹션 제목 |
| `type` | `text \| grid \| chart` | 렌더러 종류 |
| `order` | `number` | 표시 순서 |
| `visible` | `boolean` | 표시 여부 |
| `queryId` | `string?` | 등록 Query ID. `text` 유형에서는 생략 가능 |
| `refreshIntervalSec` | `5 \| 10 \| 30 \| 60` | polling 주기 |
| `mapping` | `MetadataMapping` | schema 필드와 UI의 연결 정보 |
| `defaultText` | `string?` | 정적 표시 또는 Query 실패/빈 결과 fallback 텍스트 |
| `options` | `MetadataSectionOptions` | 타입별 표시 옵션 |
| `sourceProfileStatus` | `included \| excluded` | 기본 source profile에서의 포함 상태 |

## MetadataQueryDefinition

실제 backend에서 관리할 Query Registry의 frontend 계약이다. MVP에서는 fixture로 제공한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `queryId` | `string` | 사용자가 선택하는 안정적인 ID |
| `sqlText` | `string` | 서버 보관용 read-only SQL; MVP 화면에는 노출하지 않음 |
| `allowedParameters` | `string[]` | 바인딩 가능한 파라미터 이름 |
| `resultSchema` | `MetadataResultField[]` | 결과 필드와 타입 선언 |
| `enabled` | `boolean` | 선택 가능 여부 |

## MetadataQueryResult

```ts
type MetadataResultField = {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'datetime';
};

type MetadataQueryResult = {
  queryId: string;
  schema: MetadataResultField[];
  rows: Record<string, unknown>[];
  fetchedAt: string;
};
```

## Mapping 규칙

- `text`: Query가 연결된 경우 `labelField`와 `valueField`를 선택적으로 사용하고, Query가 없거나 mapping이 비어 있으면 `defaultText`를 표시한다.
- `grid`: 표시할 column 목록을 사용하며 각 column은 `field`, `label`, 선택적 `format`을 가진다.
- `chart`: `timeField`, `series` 목록을 사용하며 series는 `field`, `label`, `color`를 가진다.
- mapping 대상 필드는 Query schema에 존재해야 한다. 누락된 필드는 섹션 단위 설정 오류로 표시한다.
- 이벤트 grid의 재생 동작은 `eventId`, `occurredAt`, `playbackAvailable` mapping이 있을 때만 활성화한다.

## UI 상태 모델

각 섹션은 `loading`, `success`, `empty`, `error`, `stale` 상태를 독립적으로 가진다.

- `loading`: 최초 조회 중이며 표시할 이전 데이터가 없음
- `success`: 최근 조회 성공
- `empty`: 성공했지만 rows가 없음
- `error`: 조회 실패 또는 mapping 오류
- `stale`: 갱신 중이지만 이전 성공 데이터가 있어 이전 값을 유지
