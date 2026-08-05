# Vision Monitor VMS - REST API 명세서 (Phase 2)

**작성일**: 2026-08-05  
**기준**: OpenAPI 3.0.0 / Swagger 호환  
**Host**: `http://localhost:8080` (개발) / `https://visionmonitor.posco.local` (운영)  
**Base Path**: `/api`

---

## API 응답 포맷 (표준)

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "success": true,
  "data": {
    // 실제 데이터
  },
  "error": null,
  "timestamp": "2026-08-05T12:34:56Z",
  "path": "/api/cameras"
}
```

### 에러 응답 예시
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CAMERA_NOT_FOUND",
    "message": "카메라를 찾을 수 없습니다",
    "details": "camera_id: 999"
  },
  "timestamp": "2026-08-05T12:34:56Z",
  "path": "/api/cameras/999"
}
```

---

## 1. 인증 (Auth)

### 1.1 사용자 로그인
```
POST /auth/login
Content-Type: application/json

{
  "username": "operator1",
  "password": "secure_password"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "operator1",
      "email": "operator1@posco.com",
      "role": "operator",
      "department": "포항 4선재"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400  // 초 단위 (24시간)
  },
  "timestamp": "2026-08-05T12:34:56Z"
}
```

### 1.2 토큰 갱신
```
POST /auth/refresh
Authorization: Bearer <expired_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

### 1.3 로그아웃
```
POST /auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": null
}
```

---

## 2. 카메라 (Camera)

### 2.1 카메라 목록 조회
```
GET /cameras
Authorization: Bearer <token>

Query Parameters:
  - location: string (선택사항) - 위치 필터
  - is_active: boolean (선택사항) - 활성 상태 필터
  - page: integer (기본값: 0)
  - size: integer (기본값: 20)

Example: GET /cameras?location=포항&is_active=true&page=0&size=20

Response: 200 OK
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "포항 4선재 라인1 입구",
        "location": "포항 제강동",
        "model": "Hikvision DS-2CD2T45FWD-I5",
        "ip_address": "192.168.1.101",
        "port": 554,
        "stream_protocol": "rtsp",
        "stream_url": "rtsp://192.168.1.101:554/stream1",
        "stream_resolution": "1920x1080",
        "stream_fps": 30,
        "is_active": true,
        "recording_enabled": true,
        "motion_detection": true,
        "timezone": "Asia/Seoul",
        "last_online": "2026-08-05T12:30:00Z",
        "created_at": "2026-07-01T08:00:00Z",
        "updated_at": "2026-08-05T12:00:00Z"
      },
      // ... 더 많은 카메라
    ],
    "pagination": {
      "page": 0,
      "size": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 2.2 카메라 상세 조회
```
GET /cameras/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "name": "포항 4선재 라인1 입구",
    // ... 동일한 필드
    "streams": [
      {
        "id": 101,
        "protocol": "hls",
        "stream_url": "http://localhost:8080/hls/camera1/index.m3u8",
        "resolution": "1920x1080",
        "fps": 30,
        "latency_ms": 5000,
        "current_status": "active"
      },
      {
        "id": 102,
        "protocol": "webrtc",
        "stream_url": "wss://localhost:8443/whep/camera1",
        "latency_ms": 300,
        "current_status": "active"
      }
    ]
  }
}
```

### 2.3 카메라 추가
```
POST /cameras
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "포항 4선재 라인2 입구",
  "location": "포항 제강동",
  "model": "Hikvision DS-2CD2T45FWD-I5",
  "ip_address": "192.168.1.102",
  "port": 554,
  "username": "admin",
  "password": "camera_password",
  "stream_protocol": "rtsp",
  "stream_url": "rtsp://192.168.1.102:554/stream1",
  "stream_resolution": "1920x1080",
  "stream_fps": 30,
  "timezone": "Asia/Seoul",
  "recording_enabled": true,
  "motion_detection": true
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 2,
    "name": "포항 4선재 라인2 입구",
    // ... 전체 필드
  }
}
```

### 2.4 카메라 수정
```
PUT /cameras/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "포항 4선재 라인1 입구 (수정됨)",
  "location": "포항 제강동 수정",
  // 수정할 필드만 포함
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    // ... 업데이트된 필드
  }
}
```

### 2.5 카메라 삭제
```
DELETE /cameras/:id
Authorization: Bearer <token>

Response: 204 No Content
또는
{
  "success": true,
  "data": null
}
```

---

## 3. 스트림 (Stream)

### 3.1 스트림 목록 조회
```
GET /cameras/:cameraId/streams
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 101,
      "camera_id": 1,
      "protocol": "hls",
      "stream_url": "http://localhost:8080/hls/camera1/index.m3u8",
      "resolution": "1920x1080",
      "fps": 30,
      "bitrate": 5000,
      "codec": "h264",
      "latency_ms": 5000,
      "packet_loss_percent": 0.0,
      "current_status": "active",
      "created_at": "2026-07-01T08:00:00Z",
      "updated_at": "2026-08-05T12:00:00Z"
    },
    {
      "id": 102,
      "camera_id": 1,
      "protocol": "webrtc",
      "stream_url": "wss://localhost:8443/whep/camera1",
      "latency_ms": 300,
      "current_status": "active"
    }
  ]
}
```

### 3.2 스트림 상세 조회
```
GET /streams/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 101,
    "camera_id": 1,
    "protocol": "hls",
    // ... 전체 필드 + 성능 메트릭
    "performance": {
      "latency_ms": 5000,
      "packet_loss_percent": 0.1,
      "buffer_size_ms": 3000,
      "dropped_frames": 2
    }
  }
}
```

### 3.3 최적 스트림 선택 (자동)
```
GET /cameras/:cameraId/streams/optimal
Authorization: Bearer <token>

Description: 현재 상태를 기반으로 최적의 스트림을 자동 선택
(1순위: WebRTC, 2순위: HLS, 3순위: DASH, Fallback: RTSP)

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 102,
    "camera_id": 1,
    "protocol": "webrtc",
    "stream_url": "wss://localhost:8443/whep/camera1",
    "latency_ms": 300,
    "reason": "Best latency for live monitoring"
  }
}
```

---

## 4. 이벤트 (Event)

### 4.1 이벤트 목록 조회 (필터링)
```
GET /events
Authorization: Bearer <token>

Query Parameters:
  - camera_id: integer (선택사항)
  - event_type: string (선택사항) - 'motion', 'object_detection', 'anomaly', 'stream_loss'
  - severity: string (선택사항) - 'info', 'warning', 'critical'
  - start_time: ISO 8601 (선택사항)
  - end_time: ISO 8601 (선택사항)
  - page: integer (기본값: 0)
  - size: integer (기본값: 20)

Example: GET /events?camera_id=1&severity=critical&start_time=2026-08-01T00:00:00Z&end_time=2026-08-05T23:59:59Z

Response: 200 OK
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 50001,
        "camera_id": 1,
        "event_type": "object_detection",
        "object_class": "defect",
        "severity": "critical",
        "event_start": "2026-08-05T12:30:00Z",
        "event_end": "2026-08-05T12:30:45Z",
        "duration_seconds": 45,
        "confidence_score": 0.95,
        "region_coordinates": {"x": 100, "y": 150, "w": 200, "h": 180},
        "description": "라인 1에서 불량품 감지",
        "status": "new",
        "assigned_to": null,
        "created_at": "2026-08-05T12:30:00Z",
        "updated_at": "2026-08-05T12:30:00Z"
      },
      // ... 더 많은 이벤트
    ],
    "pagination": {
      "page": 0,
      "size": 20,
      "total": 350,
      "totalPages": 18
    }
  }
}
```

### 4.2 카메라별 이벤트 조회
```
GET /cameras/:cameraId/events
Authorization: Bearer <token>

Query Parameters: (위와 동일)

Response: 200 OK
{
  "success": true,
  "data": {
    "content": [
      // ... 특정 카메라의 이벤트만 필터링
    ]
  }
}
```

### 4.3 이벤트 상세 조회
```
GET /events/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 50001,
    // ... 전체 필드
    "snapshot_url": "http://localhost:8080/snapshots/event_50001.jpg",
    "video_segment": {
      "start_time": "2026-08-05T12:29:00Z",
      "end_time": "2026-08-05T12:31:00Z",
      "file_path": "/recordings/camera1/2026-08-05/event_segment.mp4"
    }
  }
}
```

### 4.4 이벤트 생성 (AI 감지 결과)
```
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera_id": 1,
  "event_type": "object_detection",
  "object_class": "defect",
  "severity": "critical",
  "confidence_score": 0.95,
  "region_coordinates": {"x": 100, "y": 150, "w": 200, "h": 180},
  "description": "라인 1에서 불량품 감지"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 50001,
    // ... 생성된 이벤트
  }
}
```

### 4.5 이벤트 상태 변경
```
PUT /events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "assigned_to": 2
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 50001,
    "status": "resolved",
    "assigned_to": 2
    // ... 업데이트된 필드
  }
}
```

### 4.6 시간별 이벤트 통계
```
GET /events/stats
Authorization: Bearer <token>

Query Parameters:
  - camera_id: integer (선택사항)
  - start_time: ISO 8601 (필수)
  - end_time: ISO 8601 (필수)
  - group_by: string - 'hour', 'day', 'week' (기본값: 'hour')

Example: GET /events/stats?camera_id=1&start_time=2026-08-01T00:00:00Z&end_time=2026-08-05T23:59:59Z&group_by=day

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-08-01T00:00:00Z",
      "total_events": 12,
      "by_severity": {
        "info": 5,
        "warning": 5,
        "critical": 2
      },
      "by_type": {
        "motion": 8,
        "object_detection": 3,
        "anomaly": 1
      }
    },
    // ... 더 많은 시간대
  ]
}
```

---

## 5. 녹화 (Recording)

### 5.1 녹화 목록 조회
```
GET /recordings
Authorization: Bearer <token>

Query Parameters:
  - camera_id: integer (선택사항)
  - start_time: ISO 8601 (선택사항)
  - end_time: ISO 8601 (선택사항)
  - page: integer (기본값: 0)
  - size: integer (기본값: 20)

Response: 200 OK
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1001,
        "camera_id": 1,
        "start_time": "2026-08-05T12:00:00Z",
        "end_time": "2026-08-05T12:30:00Z",
        "duration_seconds": 1800,
        "file_path": "/recordings/camera1/2026-08-05/segment_12_00.mp4",
        "file_size_mb": 256,
        "codec": "h264",
        "resolution": "1920x1080",
        "fps": 30,
        "storage_id": "local_ssd",
        "is_archived": false,
        "retention_days": 30,
        "is_indexed": true
      }
    ]
  }
}
```

### 5.2 특정 시간대 녹화 검색
```
POST /recordings/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera_id": 1,
  "start_time": "2026-08-05T12:00:00Z",
  "end_time": "2026-08-05T14:00:00Z"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "query": {
      "camera_id": 1,
      "time_range": "2 hours"
    },
    "recordings": [
      // ... 시간대별 녹화 세그먼트
    ],
    "total_duration_seconds": 7200,
    "stream_url": "http://localhost:8080/playback/session_abc123/index.m3u8"
  }
}
```

### 5.3 녹화 재생 준비
```
GET /recordings/:id/play
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "recording_id": 1001,
    "playback_url": "http://localhost:8080/hls/playback/rec_1001/index.m3u8",
    "duration_seconds": 1800,
    "start_time": "2026-08-05T12:00:00Z",
    "stream_type": "hls",
    "seek_support": true
  }
}
```

---

## 6. 알림 설정 (Alert Setting)

### 6.1 알림 규칙 목록
```
GET /alert-settings
Authorization: Bearer <token>

Query Parameters:
  - camera_id: integer (선택사항)
  - is_enabled: boolean (선택사항)
  - page: integer (기본값: 0)
  - size: integer (기본값: 20)

Response: 200 OK
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "camera_id": 1,
        "event_type": "object_detection",
        "object_class": "defect",
        "min_confidence": 0.85,
        "min_duration_seconds": 5,
        "alert_threshold": 2,
        "time_window_seconds": 60,
        "is_enabled": true,
        "alert_type": "email",
        "alert_recipients": ["supervisor1@posco.com", "supervisor2@posco.com"],
        "webhook_url": null,
        "auto_record": true,
        "auto_snapshot": true,
        "priority": "critical",
        "is_24_hours": true,
        "active_start": null,
        "active_end": null,
        "active_days": null,
        "created_at": "2026-07-01T08:00:00Z",
        "updated_at": "2026-08-05T12:00:00Z"
      }
    ]
  }
}
```

### 6.2 알림 규칙 상세
```
GET /alert-settings/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    // ... 위와 동일한 구조
  }
}
```

### 6.3 알림 규칙 생성
```
POST /alert-settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera_id": 1,
  "event_type": "object_detection",
  "object_class": "defect",
  "min_confidence": 0.85,
  "min_duration_seconds": 5,
  "alert_threshold": 2,
  "time_window_seconds": 60,
  "is_enabled": true,
  "alert_type": "email",
  "alert_recipients": ["supervisor1@posco.com"],
  "auto_record": true,
  "auto_snapshot": true,
  "priority": "critical",
  "is_24_hours": true
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    // ... 생성된 규칙
  }
}
```

### 6.4 알림 규칙 수정
```
PUT /alert-settings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "alert_recipients": ["supervisor1@posco.com", "supervisor3@posco.com"],
  "priority": "high"
}

Response: 200 OK
{
  "success": true,
  "data": {
    // ... 업데이트된 규칙
  }
}
```

### 6.5 알림 규칙 삭제
```
DELETE /alert-settings/:id
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 7. 개인화 레이아웃 (Layout) - **핵심 기능**

### 7.1 레이아웃 목록 조회 (사용자별)
```
GET /layouts
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "tab_name": "공정 A (냉각)",
      "grid_config": {
        "rows": 3,
        "cols": 2,
        "type": "3x2"
      },
      "camera_positions": [
        {
          "cell_id": 0,
          "camera_id": 1,
          "camera_name": "포항 4선재 라인1 입구",
          "position": {"row": 0, "col": 0}
        },
        {
          "cell_id": 1,
          "camera_id": 2,
          "camera_name": "포항 4선재 라인2 입구",
          "position": {"row": 0, "col": 1}
        }
        // ... 나머지 카메라
      ],
      "is_default": false,
      "created_at": "2026-08-01T10:00:00Z",
      "updated_at": "2026-08-05T14:00:00Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "tab_name": "공정 B (속도)",
      "grid_config": {"rows": 3, "cols": 3, "type": "3x3"},
      "camera_positions": [ /* ... */ ]
    }
  ]
}
```

### 7.2 레이아웃 상세 조회
```
GET /layouts/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "tab_name": "공정 A (냉각)",
    "grid_config": {
      "rows": 3,
      "cols": 2,
      "type": "3x2"
    },
    "camera_positions": [
      // ... 자세한 카메라 정보 포함
      {
        "cell_id": 0,
        "camera_id": 1,
        "camera_name": "포항 4선재 라인1 입구",
        "position": {"row": 0, "col": 0},
        "stream_info": {
          "protocol": "hls",
          "url": "http://localhost:8080/hls/camera1/index.m3u8",
          "latency_ms": 5000
        }
      }
    ],
    "is_default": true
  }
}
```

### 7.3 레이아웃 생성 (새 탭)
```
POST /layouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "tab_name": "공정 C (포장)",
  "grid_config": {
    "rows": 2,
    "cols": 3,
    "type": "2x3"
  },
  "is_default": false
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 1,
    "tab_name": "공정 C (포장)",
    "grid_config": {"rows": 2, "cols": 3, "type": "2x3"},
    "camera_positions": [],  // 초기에는 비어있음
    "is_default": false
  }
}
```

### 7.4 레이아웃 업데이트 (카메라 배치)
```
PUT /layouts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "tab_name": "공정 A (냉각) - 수정됨",
  "grid_config": {
    "rows": 3,
    "cols": 3,  // 2에서 3으로 변경
    "type": "3x3"
  },
  "camera_positions": [
    {
      "cell_id": 0,
      "camera_id": 1,
      "position": {"row": 0, "col": 0}
    },
    {
      "cell_id": 1,
      "camera_id": 2,
      "position": {"row": 0, "col": 1}
    },
    {
      "cell_id": 2,
      "camera_id": 3,
      "position": {"row": 0, "col": 2}
    },
    {
      "cell_id": 3,
      "camera_id": null,  // 빈 셀
      "position": {"row": 1, "col": 0}
    }
    // ... 나머지 셀
  ]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    // ... 업데이트된 레이아웃
  }
}
```

### 7.5 셀에 카메라 추가 (개별)
```
PUT /layouts/:id/cells/:cellId
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera_id": 5,
  "position": {"row": 1, "col": 0}
}

Response: 200 OK
{
  "success": true,
  "data": {
    "cell_id": 3,
    "camera_id": 5,
    "camera_name": "포항 4선재 라인3 출구",
    "position": {"row": 1, "col": 0}
  }
}
```

### 7.6 셀에서 카메라 제거
```
DELETE /layouts/:id/cells/:cellId
Authorization: Bearer <token>

Response: 204 No Content
또는
{
  "success": true,
  "data": null
}
```

### 7.7 레이아웃 삭제
```
DELETE /layouts/:id
Authorization: Bearer <token>

Response: 204 No Content
```

### 7.8 레이아웃 순서 변경 (드래그 & 드롭)
```
PUT /layouts/:id/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera_positions": [
    {
      "cell_id": 0,
      "camera_id": 2,  // 원래 cell 1의 카메라
      "position": {"row": 0, "col": 0}
    },
    {
      "cell_id": 1,
      "camera_id": 1,  // 원래 cell 0의 카메라
      "position": {"row": 0, "col": 1}
    }
    // ... 나머지
  ]
}

Response: 200 OK
{
  "success": true,
  "data": {
    // ... 업데이트된 레이아웃
  }
}
```

### 7.9 기본 레이아웃 설정
```
PUT /layouts/:id/set-default
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "is_default": true
  }
}
```

---

## 8. 실시간 이벤트 (Server-Sent Events)

### 8.1 SSE 스트림 구독
```
GET /events/stream
Authorization: Bearer <token>

Query Parameters (선택사항):
  - camera_id: integer
  - severity: string ('warning', 'critical')

Example: GET /events/stream?camera_id=1&severity=critical

Connection: Keep-Alive
Content-Type: text/event-stream

--- 실시간 메시지 ---

id: 1
event: event
data: {
  "id": 50001,
  "camera_id": 1,
  "event_type": "object_detection",
  "severity": "critical",
  "event_start": "2026-08-05T12:30:00Z",
  "description": "라인 1에서 불량품 감지"
}

id: 2
event: event
data: {
  "id": 50002,
  "camera_id": 2,
  "event_type": "motion",
  "severity": "warning",
  "event_start": "2026-08-05T12:31:00Z"
}
```

---

## 9. 시스템 상태 & 헬스 체크

### 9.1 헬스 체크
```
GET /health
Content-Type: application/json

Response: 200 OK (또는 503 Service Unavailable)
{
  "success": true,
  "data": {
    "status": "UP",
    "timestamp": "2026-08-05T12:34:56Z",
    "components": {
      "database": {
        "status": "UP",
        "latency_ms": 5
      },
      "cache": {
        "status": "UP",
        "latency_ms": 2
      },
      "storage": {
        "status": "UP",
        "available_space_gb": 450
      }
    }
  }
}
```

### 9.2 시스템 상태
```
GET /status
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "uptime_seconds": 259200,
    "active_cameras": 12,
    "total_cameras": 15,
    "offline_cameras": 3,
    "active_streams": 24,
    "avg_latency_ms": 3500,
    "total_events_24h": 245,
    "critical_events_24h": 12,
    "storage_usage": {
      "used_gb": 150,
      "total_gb": 500,
      "percent": 30
    },
    "database": {
      "connection_pool_active": 8,
      "connection_pool_total": 20
    }
  }
}
```

---

## 10. 사용자 관리 (User)

### 10.1 사용자 목록 (관리자)
```
GET /users
Authorization: Bearer <token> (admin 역할)

Response: 200 OK
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "username": "operator1",
        "email": "operator1@posco.com",
        "role": "operator",
        "department": "포항 4선재",
        "assigned_cameras": [1, 2, 3],
        "can_download": true,
        "can_configure": false,
        "is_active": true,
        "last_login": "2026-08-05T12:00:00Z"
      }
    ]
  }
}
```

### 10.2 사용자 생성 (관리자)
```
POST /users
Authorization: Bearer <token> (admin 역할)
Content-Type: application/json

{
  "username": "operator2",
  "email": "operator2@posco.com",
  "password": "temp_password_123",
  "role": "operator",
  "department": "포항 4선재",
  "assigned_cameras": [1, 2, 3, 4]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 2,
    // ... 생성된 사용자 정보
  }
}
```

---

## 11. 감사 로그 (Audit Log)

### 11.1 감사 로그 조회 (관리자)
```
GET /audit-logs
Authorization: Bearer <token> (admin 역할)

Query Parameters:
  - user_id: integer (선택사항)
  - action: string (선택사항)
  - entity_type: string (선택사항)
  - start_time: ISO 8601 (선택사항)
  - end_time: ISO 8601 (선택사항)
  - page: integer (기본값: 0)
  - size: integer (기본값: 20)

Response: 200 OK
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 100001,
        "user_id": 1,
        "username": "operator1",
        "action": "download",
        "entity_type": "recording",
        "entity_id": 1001,
        "description": "녹화 파일 다운로드",
        "old_value": null,
        "new_value": null,
        "ip_address": "192.168.1.100",
        "timestamp": "2026-08-05T12:30:00Z"
      }
    ]
  }
}
```

---

## API 에러 코드

| 코드 | HTTP 상태 | 설명 | 예시 |
|------|-----------|------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 | 토큰 없음 또는 만료됨 |
| `FORBIDDEN` | 403 | 권한 부족 | 관리자 권한 필요 |
| `NOT_FOUND` | 404 | 리소스 없음 | 카메라/이벤트 ID 없음 |
| `CONFLICT` | 409 | 중복 데이터 | 카메라 이름 중복 |
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 | 필수 필드 누락 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 오류 | 데이터베이스 연결 실패 |

---

**API 문서 완성 날짜**: 2026-08-05  
**관련 자료**: `docs/ARCHITECTURE.md`, `docs/SCREENS.md`
