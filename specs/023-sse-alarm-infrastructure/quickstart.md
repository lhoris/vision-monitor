# SSE 인프라 빠른 확인

1. 백엔드를 local profile로 실행한다.
2. 로그인하여 `authToken`을 확보한다.
3. `GET /api/alarms/stream`에 `Authorization: Bearer <token>`을 지정한다.
4. 연결 직후 `connected` event와 15초 주기의 `heartbeat` event를 확인한다.
5. 후속 알람 생성 코드에서 `AlarmEventPublisher.publishToUser(username, event)`를 호출하면 `alarm` event가 해당 사용자에게 전달된다.

현재 기능은 인메모리 broker이므로 백엔드 재시작 시 연결과 이벤트는 유지되지 않는다.

## 모델 서버에서 warning 보내기

백엔드 실행 시 `MODEL_SERVER_KEY` 환경 변수를 설정한다. Python 프로세스는 사용자용 SSE endpoint가 아니라 공통 알람 수신 endpoint를 호출한다.

```python
import requests

requests.post(
    "http://localhost:8080/api/alarms/events",
    headers={"X-Model-Server-Key": "model-secret"},
    json={
        "id": 101,
        "source": "MODEL_SERVER",
        "type": "PERSON_DETECTED",
        "severity": "warning",
        "modelProcessId": 12,
        "description": "Restricted area detected",
        "occurredAt": "2026-10-16T12:00:00Z",
        "metadata": {"zone": "A-01"},
    },
    timeout=3,
)
```

백엔드는 수신한 warning을 현재 연결된 모든 사용자에게 SSE `alarm` event로 전달한다.

## 검증 결과

- `backend/mvnw.cmd -q test`: 통과
- `frontend/npm test -- --run src/services/__tests__/alarmSseService.test.ts`: 3개 테스트 통과
- `frontend/npm run build`: TypeScript 검사 및 production build 통과
