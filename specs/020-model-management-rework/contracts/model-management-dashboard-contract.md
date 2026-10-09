# 모델 관리 대시보드 계약

## 조회 응답

`GET /api/model-processes/dashboard`

```json
{
  "refreshedAt": "2026-10-09T10:00:00Z",
  "vms": [
    {
      "vmId": "vm-001",
      "vmName": "AI VM 01",
      "hostAddress": "192.168.0.101",
      "connectionStatus": "CONNECTED",
      "lastHeartbeatAt": "2026-10-09T09:59:58Z",
      "processes": [
        {
          "processId": "proc-001",
          "processName": "entry-zone-monitor.py",
          "modelName": "Entry Zone Monitor",
          "processArea": "가열",
          "processStatus": "RUNNING",
          "controlRequestStatus": null,
          "lastStatusAt": "2026-10-09T09:59:57Z"
        }
      ]
    }
  ]
}
```

## 제어 요청

`POST /api/model-processes/{processId}/actions/{action}`

- 허용 action: `start`, `stop`, `restart`
- 성공 응답은 실제 프로세스 완료가 아니라 제어 요청 접수 결과를 의미한다.
- 화면은 이후 조회 결과로 실제 프로세스 상태를 갱신한다.
- 오류 응답은 사용자에게 표시할 수 있는 `message`를 포함한다.

## 설정 관리

- `GET /api/model-processes/manage`: 그리드 편집 대상 조회
- `POST /api/model-processes`: 신규 등록
- `PUT /api/model-processes/{processId}`: 설정 수정
- `PATCH /api/model-processes/{processId}/enabled`: 활성화 또는 비활성화

1차 구현에서는 기존 `modelManagementService.ts`의 경계를 유지하며 위 계약을 mock adapter로 제공할 수 있다. 실제 endpoint 전환 시 컴포넌트가 직접 fetch하지 않도록 한다.
