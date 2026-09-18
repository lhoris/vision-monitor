# Metadata Query Mock Contract

## 목적

현재 MVP는 backend 없이 동작하지만, 이후 DB Query Registry와 API로 교체할 수 있도록 설정·조회·결과의 경계를 고정한다.

## Profile API

```ts
getMetadataProfile(input: {
  userId: string;
  sourceId: string;
}): Promise<MetadataLayoutProfile>;

saveMetadataProfile(profile: MetadataLayoutProfile): Promise<MetadataLayoutProfile>;

resetMetadataProfile(input: {
  userId: string;
  sourceId: string;
}): Promise<MetadataLayoutProfile>;
```

MVP 구현은 localStorage adapter를 사용한다. 저장 키는 `metadata-layout:${userId}:${sourceId}`이며, 잘못된 저장값은 기본 profile로 대체한다.

## Query Registry API

```ts
listMetadataQueries(): Promise<MetadataQueryDefinition[]>;

executeMetadataQuery(input: {
  queryId: string;
  sourceId: string;
  cameraId?: string;
  parameters?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}): Promise<MetadataQueryResult>;
```

`queryId`는 `listMetadataQueries` 결과에 있는 enabled Query만 선택 가능하다. 단, `text` 섹션은 Query ID 없이 정적 `defaultText`만 사용할 수 있다. MVP mock은 sourceId와 queryId 조합에 따른 fixture를 반환한다.

텍스트 섹션의 Query가 선택된 경우에도 `defaultText`, `labelField`, `valueField`는 선택사항이다. 결과 rows가 없거나 조회가 실패하면 `defaultText`를 fallback으로 표시한다.

## 에러 계약

```ts
type MetadataQueryError = {
  code: 'QUERY_NOT_FOUND' | 'QUERY_DISABLED' | 'INVALID_MAPPING' | 'QUERY_FAILED';
  message: string;
  queryId?: string;
};
```

오류는 섹션 단위로 처리한다. 다른 섹션의 rendering과 polling은 계속되어야 한다.

## 향후 backend 전환 규칙

1. SQL text는 서버/DB에서만 관리하고 브라우저에는 Query ID와 결과 schema만 제공한다.
2. 파라미터는 `allowedParameters`에 포함된 값만 바인딩한다.
3. Query는 read-only로 제한하며 DDL/DML은 거부한다.
4. 서버 응답은 `queryId`, `schema`, `rows`, `fetchedAt`을 유지한다.
5. profile 저장 API도 `(userId, sourceId)` 범위를 보장하여 사용자 간 설정이 섞이지 않게 한다.
