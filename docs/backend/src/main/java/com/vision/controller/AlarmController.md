# AlarmController Python 알람 전송 가이드

## 목적

모델 서버의 Python 프로세스에서 warning 또는 detection 이벤트가 발생했을 때, Vision Monitor 백엔드의 `AlarmController`로 전송하는 방법을 설명한다.

Python 프로세스는 브라우저용 SSE endpoint에 직접 접속하지 않는다. Python은 공통 알람 수신 endpoint로 HTTP 요청을 보내고, 백엔드는 현재 연결된 모든 브라우저에 SSE `alarm` 이벤트를 전달한다.

## 처리 흐름

```text
Python 모델 프로세스
  -> POST /api/alarms/events
  -> AlarmController가 X-Model-Server-Key 검증
  -> AlarmEventPublisher가 전체 SSE 연결로 fan-out
  -> 브라우저 GET /api/alarms/stream 구독자
```

## 백엔드 설정

백엔드 실행 환경에 모델 서버와 공유할 키를 설정한다.

```powershell
$env:MODEL_SERVER_KEY = "change-this-to-a-long-random-secret"
```

Linux 또는 컨테이너 환경에서는 다음처럼 설정한다.

```bash
export MODEL_SERVER_KEY='change-this-to-a-long-random-secret'
```

`MODEL_SERVER_KEY`가 비어 있으면 모델 서버 알람 endpoint는 모든 요청을 `403 Forbidden`으로 거부한다. 키는 Python 프로세스와 백엔드에만 보관하고 소스 코드나 Git에 저장하지 않는다.

## Endpoint

| 항목 | 값 |
| --- | --- |
| Method | `POST` |
| URL | `/api/alarms/events` |
| Content-Type | `application/json` |
| 인증 헤더 | `X-Model-Server-Key: <MODEL_SERVER_KEY>` |
| 성공 응답 | `202 Accepted` |

이 endpoint는 사용자 세션 인증이 아니라 모델 서버 전용 service key를 사용한다. 따라서 Python 요청에 브라우저 사용자 token을 넣지 않는다.

## 요청 본문

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
| `id` | number, 선택 | 이벤트 식별자. 생략하면 백엔드가 현재 시각 기반 값을 생성한다. |
| `source` | string, 선택 | 이벤트 발생 주체. 예: `MODEL_SERVER` |
| `type` | string, 선택 | 이벤트 유형. 예: `PERSON_DETECTED`, `FIRE_DETECTED` |
| `severity` | string, 선택 | 심각도. 예: `info`, `warning`, `critical` |
| `cameraId` | number, 선택 | 이벤트가 발생한 카메라 ID |
| `description` | string, 선택 | 사용자에게 표시할 설명 |
| `occurredAt` | ISO-8601 datetime, 선택 | 모델이 이벤트를 감지한 시각. 예: `2026-10-16T12:00:00Z` |
| `metadata` | object, 선택 | 모델 결과, 구역, confidence 등 추가 정보 |

모든 필드는 현재 DTO에서 선택 사항이다. 다만 사용자 화면에서 의미 있는 알람을 표시하려면 최소한 `source`, `type`, `severity`, `cameraId`, `description`, `occurredAt`을 채우는 것을 권장한다.

## Python 구현

### 최소 구현

```python
import os
from datetime import datetime, timezone

import requests


ALARM_ENDPOINT = os.environ["VISION_MONITOR_ALARM_ENDPOINT"]
MODEL_SERVER_KEY = os.environ["MODEL_SERVER_KEY"]


def send_alarm(camera_id: int, description: str, confidence: float) -> None:
    payload = {
        "source": "MODEL_SERVER",
        "type": "PERSON_DETECTED",
        "severity": "warning",
        "cameraId": camera_id,
        "description": description,
        "occurredAt": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "confidence": confidence,
        },
    }

    response = requests.post(
        ALARM_ENDPOINT,
        headers={
            "X-Model-Server-Key": MODEL_SERVER_KEY,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=3,
    )
    response.raise_for_status()


send_alarm(7, "Restricted area detected", 0.97)
```

실행 전에 다음 환경 변수를 설정한다.

```powershell
$env:VISION_MONITOR_ALARM_ENDPOINT = "http://localhost:8080/api/alarms/events"
$env:MODEL_SERVER_KEY = "change-this-to-a-long-random-secret"
```

### 모델 loop에서 사용

감지 결과가 발생한 순간에만 `send_alarm`을 호출한다. 매 frame마다 전송하면 동일 알람이 과도하게 발생하므로 카메라별 cooldown 또는 동일 이벤트 deduplication을 적용한다.

```python
last_sent_at = {}


def handle_detection(camera_id: int, confidence: float, now: float) -> None:
    cooldown_seconds = 10
    if now - last_sent_at.get(camera_id, 0) < cooldown_seconds:
        return

    send_alarm(
        camera_id=camera_id,
        description="Restricted area detected",
        confidence=confidence,
    )
    last_sent_at[camera_id] = now
```

## 실패 처리와 재시도

- `202`: 백엔드가 이벤트를 수락했다는 의미다. SSE 연결 상태나 사용자의 화면 표시까지 보장하는 응답은 아니다.
- `403`: `MODEL_SERVER_KEY`가 백엔드에 설정되지 않았거나 요청 헤더의 키가 일치하지 않는다.
- `400`: JSON 형식 또는 날짜 형식이 올바르지 않다.
- `5xx`, timeout, connection error: 백엔드 연결 또는 서버 오류이므로 제한된 횟수로 exponential backoff 재시도를 적용한다.

재시도 시 동일 이벤트가 중복 표시될 수 있다. 중복을 줄이려면 재시도 가능한 요청에 고유한 `id`를 넣고, 모델 프로세스에서 이벤트별 전송 상태를 관리한다. 현재 endpoint는 `id` 기준 중복 제거를 수행하지 않으므로, 중복 제거가 필요하면 별도 요구사항으로 backend deduplication을 추가해야 한다.

```python
import time


def send_alarm_with_retry(payload: dict, attempts: int = 3) -> None:
    for attempt in range(attempts):
        response = None
        try:
            response = requests.post(
                ALARM_ENDPOINT,
                headers={"X-Model-Server-Key": MODEL_SERVER_KEY},
                json=payload,
                timeout=3,
            )
            if response.status_code >= 400:
                response.raise_for_status()
            return
        except requests.RequestException:
            if response is not None and response.status_code < 500:
                raise
            if attempt == attempts - 1:
                raise
            time.sleep(2**attempt)
```

## curl로 연결 확인

Python 코드를 실행하기 전에 endpoint와 service key를 다음처럼 확인할 수 있다.

```bash
curl -i -X POST "http://localhost:8080/api/alarms/events" \
  -H "Content-Type: application/json" \
  -H "X-Model-Server-Key: change-this-to-a-long-random-secret" \
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

정상 응답은 HTTP `202`와 다음 형태다.

```json
{
  "success": true,
  "data": {
    "accepted": true
  }
}
```

브라우저가 `GET /api/alarms/stream`을 구독 중이면 해당 알람이 SSE `alarm` 이벤트로 전달된다. 모델 서버는 SSE endpoint를 구독하거나 사용자별 username을 알 필요가 없다.

## 운영 체크리스트

- 백엔드와 Python 프로세스에 동일한 `MODEL_SERVER_KEY`를 안전하게 주입한다.
- 운영에서는 HTTPS URL을 사용해 service key가 평문 네트워크에 노출되지 않도록 한다.
- `requests.post`에 반드시 짧은 `timeout`을 지정해 모델 추론 loop가 멈추지 않게 한다.
- 감지 frame마다 전송하지 말고 cooldown 또는 이벤트 상태 변화를 기준으로 전송한다.
- 전송 실패 로그에는 payload 전체나 service key를 기록하지 않는다.
- `202` 수신 후에도 브라우저 SSE 연결 여부는 별도로 모니터링한다.
