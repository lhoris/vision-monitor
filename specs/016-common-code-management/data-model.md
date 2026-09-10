# 데이터 모델

## Code

| 필드 | 저장 컬럼 | 설명 |
|---|---|---|
| id | `CODE_ID` | 공통코드 PK |
| code | `CODE_NAME` | 화면과 API에서 사용하는 코드 식별자 |
| description | `CODE_DESCRIPTION` | 코드 설명 |
| type | `CODE_TYPE` | 코드 분류 또는 사용 영역 |
| dataEndStatus | `DATA_END_STATUS` | `N` 활성, `Y` 비활성 |
| remarks | `REMARKS` | 관리자 비고 |

## CodeDetail

| 필드 | 저장 컬럼 | 설명 |
|---|---|---|
| id | `CODE_DETAIL_ID` | 상세 PK |
| codeId | `CODE_ID` | 마스터 식별자 값 |
| value | `CODE_VALUE` | 업무에서 전달하는 코드값 |
| name | `CODE_VALUE_NAME` | 화면 표시명 |
| description | `CODE_VALUE_DESCRIPTION` | 상세 설명 |
| sortOrder | `SORT_ORDER` | 오름차순 표시 순서 |
| defaultValue | `DEFAULT_VALUE` | 기본값 여부 또는 기본값 식별값 |
| dataEndStatus | `DATA_END_STATUS` | `N` 활성, `Y` 비활성 |
| remarks | `REMARKS` | 관리자 비고 |

## RuntimeCommonCode

일반 조회 API의 응답 모델이다.

```json
{
  "code": "VIDEO_PROTOCOL",
  "description": "영상 프로토콜",
  "type": "SYSTEM",
  "items": [
    { "value": "HLS", "name": "HLS", "sortOrder": 1, "defaultValue": "N" }
  ]
}
```

응답에는 활성 마스터와 활성 상세값만 포함하고, 상세값은 `sortOrder`, `CODE_DETAIL_ID` 순으로 정렬한다.
