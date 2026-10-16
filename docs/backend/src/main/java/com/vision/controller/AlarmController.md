# AlarmController Python 알람 전송 가이드

모델 서버에서 warning이 발생하면 아래 endpoint로 HTTP `POST` 요청을 보낸다. 백엔드는 요청을 현재 연결된 브라우저에 SSE `alarm` 이벤트로 전달한다.

## 접속 정보

```text
서버: 172.18.86.79:8080
알람 전송 URL: http://172.18.86.79:8080/api/alarms/events
인증 헤더: X-Model-Server-Key
공유 키: yEICEeuuLY5Uh5LfX83SEyjQtu8vD/MqRUzMg8Fs5qU=
```

현재 공유 키는 `backend/src/main/resources/application.yml`에 하드코딩되어 있다. 키를 변경하면 백엔드 설정과 Python 코드의 값을 함께 변경하고 백엔드를 재시작한다.

## 요청 형식

```http
POST http://172.18.86.79:8080/api/alarms/events
Content-Type: application/json
X-Model-Server-Key: yEICEeuuLY5Uh5LfX83SEyjQtu8vD/MqRUzMg8Fs5qU=
```

```json
{
  "id": 101,
  "source": "MODEL_SERVER",
  "type": "PERSON_DETECTED",
  "severity": "warning",
  "cameraId": 7,
  "description": "Restricted area detected",
  "occurredAt": "2026-10-16T12:00:00Z",
  "metadata": {
    "zone": "A-01",
    "confidence": 0.97
  }
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | number | 이벤트 식별자. 생략하면 백엔드가 생성한다. |
| `source` | string | 이벤트 발생 주체. 예: `MODEL_SERVER` |
| `type` | string | 이벤트 유형. 예: `PERSON_DETECTED` |
| `severity` | string | 심각도. 예: `info`, `warning`, `critical` |
| `cameraId` | number | 카메라 ID |
| `description` | string | 화면에 표시할 설명 |
| `occurredAt` | ISO-8601 string | 이벤트 발생 시각. 예: `2026-10-16T12:00:00Z` |
| `metadata` | object | confidence, zone 등 추가 정보 |

## Python 구현

`requests`를 설치한다.

```bash
pip install requests
```

```python
from datetime import datetime, timezone

import requests


ALARM_ENDPOINT = "http://172.18.86.79:8080/api/alarms/events"
MODEL_SERVER_KEY = "yEICEeuuLY5Uh5LfX83SEyjQtu8vD/MqRUzMg8Fs5qU="


def send_alarm(camera_id: int, description: str, confidence: float) -> None:
    response = requests.post(
        ALARM_ENDPOINT,
        headers={
            "X-Model-Server-Key": MODEL_SERVER_KEY,
            "Content-Type": "application/json",
        },
        json={
            "source": "MODEL_SERVER",
            "type": "PERSON_DETECTED",
            "severity": "warning",
            "cameraId": camera_id,
            "description": description,
            "occurredAt": datetime.now(timezone.utc).isoformat(),
            "metadata": {"confidence": confidence},
        },
        timeout=3,
    )
    response.raise_for_status()


send_alarm(7, "Restricted area detected", 0.97)
```

모델 loop에서는 같은 알람이 frame마다 반복 전송되지 않도록 감지 상태가 바뀌었을 때만 호출하거나 camera별 cooldown을 적용한다.

## curl 테스트

```bash
curl -i -X POST "http://172.18.86.79:8080/api/alarms/events" \
  -H "Content-Type: application/json" \
  -H "X-Model-Server-Key: yEICEeuuLY5Uh5LfX83SEyjQtu8vD/MqRUzMg8Fs5qU=" \
  -d '{
    "id": 101,
    "source": "MODEL_SERVER",
    "type": "PERSON_DETECTED",
    "severity": "warning",
    "cameraId": 7,
    "description": "Restricted area detected",
    "occurredAt": "2026-10-16T12:00:00Z",
    "metadata": {"confidence": 0.97}
  }'
```

정상 응답은 HTTP `202`이며 응답 본문은 다음과 같다.

```json
{
  "success": true,
  "data": {
    "accepted": true
  }
}
```

## 오류 확인

- `403`: 인증 헤더의 키가 백엔드 설정과 다르다.
- `400`: JSON 형식 또는 `occurredAt` 날짜 형식이 올바르지 않다.
- `5xx` 또는 timeout: 백엔드 연결 문제다. 짧은 간격의 제한된 재시도를 적용한다.

`202`를 받으면 백엔드가 알람을 수락한 것이다. 브라우저 화면에는 SSE 연결이 정상일 때 `alarm` 이벤트로 표시된다.
