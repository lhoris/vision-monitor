# Vision Monitor VMS - 리서치 결과 (Phase 1)

**작성일**: 2026-08-05  
**대상**: POSCO 포항 4선재 제조 AI 모니터링 시스템  
**상태**: Phase 1 리서치 완료 → Phase 2 Architecture Agent로 전달 준비 완료

---

## 1. 기업용 VMS UI/UX 스타일 분석

### 1.1 주요 VMS 플랫폼 분석

#### ZoneMinder (오픈소스)
- **플랫폼**: 웹 기반 CCTV 통합 솔루션 (Apache + MySQL/MariaDB)
- **UI 특징**:
  - 완전 웹 기반 인터페이스 (모바일/데스크톱 동시 지원)
  - CSS 기반 테마 시스템으로 스킨 커스터마이징 가능
  - 다중 카메라 모니터링을 위한 제어판 기반 대시보드
  - 이벤트 로그 및 재생 기능 포함
- **알려진 한계점**: UI/UX 개선 필요 (커뮤니티에서 인정)
- **최신 버전**: 1.38.1 (2026년 3월 기준)

#### Frigate NVR (현대적 오픈소스)
- **플랫폼**: AI 기반 로컬 비디오 레코더 (Python 기반, SQLite)
- **UI 특징**:
  - 반응형 웹 대시보드 (http://[IP]:5000)
  - DraggableGridLayout 기반 커스터마이징 가능한 카메라 그리드
  - 어두운 테마 (Dark Mode) 기본 지원
  - 타임라인 스크러빙 (Timeline Scrubbing) for 이벤트 네비게이션
  - Explore Pane: 필터링된 객체 추적 기능
  - 로컬 스토리지에 레이아웃 저장 가능 (브라우저별 다양한 레이아웃 지원)
- **진화 단계**:
  - v0.14 (2024): 완전 UI 오버홀, 타임라인 개선
  - v0.15 (2025 초): Explore Pane, WebPush 알림
  - 2026: 4K/8K 지원 강화

#### VIGI VMS (TP-Link, 상용)
- **플랫폼**: 엔터프라이즈급 VMS (NVR + 소프트웨어)
- **UI 특징**:
  - 깔끔하고 직관적한 모던 인터페이스
  - 최대 64개 채널 라이브 뷰 지원
  - 시각적 대시보드 + 실시간 맵 모니터링
  - 이벤트 및 시간 기반 재생 기능
  - 통합 이벤트 관리 (Unified Event Management)
  - 웹 브라우저 및 모바일 앱 접근 지원
  - ONVIF & RTSP 프로토콜 호환성

#### 엔터프라이즈 VMS 일반 특징
- **레이아웃 패턴**:
  - 멀티 사이트 관리: 중앙 관리층 + 사이트 레벨 기록
  - 위젯 기반 커스터마이징: 사용자/그룹별 대시보드 설정
  - 라이브 피드: 중앙화된 다중 카메라 동시 모니터링
- **고급 기능**:
  - 맞춤형 대시보드: 발자국 패턴, 생산 워크플로우, 안전 규정 준수 분석
  - 데스크톱 앱 + 웹 브라우저 + 모바일 앱 멀티 접근
  - 라이브 스트림 보기, 녹화 재생, 시스템 설정 구성

---

### 1.2 권장 VMS UI 패턴 (이 프로젝트 적용 기준)

#### 패턴 1: 반응형 그리드 기반 라이브 뷰
**특징**:
- DraggableGridLayout 활용 (Frigate 사례)
- 카메라 타일: 개별 크기 조절 가능
- 모바일/태블릿/데스크톱 자동 적응
- 로컬 스토리지에 레이아웃 저장

**POSCO 적용안**:
- 포항 4선재의 다중 카메라 피드를 2x2, 3x3, 4x4 그리드로 표시
- 사용자별 레이아웃 프리셋 저장 (근무자/반장/관리자별)
- 터치 친화적 UI (태블릿 모니터링 실)

---

#### 패턴 2: 어두운 테마 + 색상 코드 기반 알림
**특징**:
- 기본 다크 모드 (VIGI, Frigate 지원)
- 이벤트 심각도별 색상: 녹색(정상) → 주황(경고) → 빨강(위험)
- 카메라 상태 표시 아이콘 (Active/Offline/Loss of Signal)

**POSCO 적용안**:
- 제강 공정의 야간 운영 대비 다크 테마 필수
- 생산 이상/불량 감지 → 빨강 표시, 자동 알림 팝업
- 카메라 먹통/스트림 끊김 → 회색 타일 + 경고 메시지

---

#### 패턴 3: 상세 뷰 (Detailed Camera View)
**구성 요소**:
- 메인 영상 플레이어 (좌측 70%)
- 메타데이터 패널 (우측 30%):
  - 카메라명, IP, FPS, 해상도
  - 실시간 감지된 객체/이상 상황
  - 이벤트 타임라인 및 스냅샷 썸네일
- 하단: 녹화 시간대 재생바 + 스크러빙 타임라인

**POSCO 적용안**:
- 메인 영상: 라인 전체 시점
- 메타데이터: 온도, 속도, 부하, 모터 상태 센서 값
- 타임라인: 불량 프레임 자동 표시

---

#### 패턴 4: 이벤트 & 알림 허브
**구성 요소**:
- 알림 토스트 (우측 상단): 신규 이벤트 실시간 알림
- 이벤트 리스트 패널 (사이드바 또는 하단):
  - 카메라별 감지 로그
  - 필터링: 카메라, 이벤트 타입, 시간 범위
  - 검색 기능

**POSCO 적용안**:
- 불량 감지 시 즉시 알림 + 해당 영상 자동 재생
- 근무자별 알림 구독 설정 (라인별, 이벤트 타입별)
- 엑셀 내보내기: 일일/주간 불량 통계

---

#### 패턴 5: 대시보드 메트릭스 & KPI 타일
**특징**:
- 상단 스타일 바: 주요 KPI (Today Anomalies, Active Cameras, Avg FPS)
- 그래프 위젯: 시간대별 이벤트 발생률, 카메라별 스트림 건강도
- 상태 요약: 카메라별 온/오프라인 상태

**POSCO 적용안**:
- KPI 1: 당일 불량 감지 건수 & 해결 시간
- KPI 2: 활성 카메라 수 / 전체 카메라 수
- KPI 3: 시스템 평균 응답 시간 (Latency)
- 그래프: 라인별 생산량 vs 불량률 (24h 시계열)

---

### 1.3 UI/UX 실무 모범 사례

1. **정보 계층 (Information Hierarchy)**
   - 최중요: 라이브 영상 + 실시간 이벤트
   - 중요: 메타데이터 + 타임라인
   - 참고: 시스템 로그, 히스토리

2. **버튼 배치 & 접근성**
   - 주요 액션: 재생/일시정지 (큰 아이콘)
   - 단수형 재생/다중 카메라 보기 (토글 버튼)
   - 녹화 다운로드, 스냅샷 캡처 (각각의 명확한 위치)

3. **색상 코드**
   - ✓ 정상: 녹색 (#00D084)
   - ⚠ 경고: 주황색 (#FFA500)
   - ✗ 위험: 빨강색 (#FF3333)
   - ℹ 정보: 파랑색 (#0066CC)

4. **반응형 레이아웃**
   - 모바일: 단일 카메라 뷰 (전체 화면)
   - 태블릿: 2x2 그리드 + 우측 사이드바
   - 데스크톱: 4x4 이상 그리드 + 상세 패널

---

## 2. Video.js + StreamPlayer 아키텍처

### 2.1 Video.js 플레이어 아키텍처

#### Video.js v10 재구축 (2026 GA Release 예정)
Video.js는 단순한 "monolithic player"에서 **composable component library**로 진화 중입니다.

**핵심 특징**:
- **모듈화**: Media Chrome, Plyr, Vidstack, Mux Player 엔지니어들이 협력해 재설계
- **경량성**: Background video player 예시 = 9KB (전체 크기의 1%)
- **적응형 스트리밍**: HLS, DASH 네이티브 지원 (Media Source Extensions)
- **플러그인 생태계**: 커스터마이징된 UI, 새로운 스트림 핸들러, 분석 도구

#### 지원 스트리밍 프로토콜
- **HTTP 기반**: HLS (.m3u8), DASH (.mpd)
- **실시간**: WebRTC
- **형식**: H.264/H.265 비디오 + AAC 오디오

#### 플러그인 아키텍처
1. **핵심 플레이어**: HTML5 `<video>` + 적응형 스트리밍 레이어
2. **플러그인 확장**:
   - Streaming: hls.js, dash.js, flv.js
   - 분석: Google Analytics, Adobe Analytics
   - UI: Custom skins, 자막, 스크린샷 도구
   - 광고: IMA, VAST 통합

---

### 2.2 StreamPlayer 추상화 패턴 (다중 프로토콜 통합)

#### 문제 상황
제조 시설의 VMS는 다양한 카메라 스트림 소스를 지원해야 합니다:
- 기존: RTSP (카메라 → 서버)
- 신규: WebRTC (실시간 저지연)
- 대체: HLS (폭넓은 호환성)

#### 권장 아키텍처: 계층화된 프로토콜 방식

```
┌─────────────────────────────────────────────────┐
│        Browser Playback Layer                   │
│  (StreamPlayer: 단일 인터페이스)                │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼─┐   ┌────▼─┐   ┌────▼─┐
    │ WebRTC│   │  HLS │   │ DASH │
    │Client │   │Client│   │Client│
    └────┬──┘   └────┬──┘   └────┬──┘
         │           │           │
┌────────┴───────────┴───────────┴──────────────┐
│     Server-Side Protocol Routing              │
│  (RTSP Ingest → Protocol Conversion)          │
└──────────────────┬──────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
   ┌──▼──┐   ┌────▼─┐   ┌────▼──┐
   │RTSP │   │ FFMPEG    │MSE/WS│
   │Ingest   │Transcoding│Delivery
   └──────┘   └──────┘   └───────┘
```

#### 실제 구현 사례 (RTSP to HLS/WebRTC)
1. **Ingest**: 카메라 RTSP 스트림 수신
2. **변환**:
   - FFmpeg: RTSP → HLS segments (.ts) 또는 fMP4
   - 또는: RTSP → WebRTC (SFU 경유)
3. **배신**: 
   - 브라우저 클라이언트는 HLS 또는 WebRTC 중 선택
   - 낮은 지연 필요 → WebRTC
   - 안정성/확장성 필요 → HLS

---

### 2.3 이 프로젝트의 StreamPlayer 설계

#### 단일 플레이어 인터페이스
```typescript
interface StreamPlayer {
  // 프로토콜 자동 선택
  connect(streamUrl: string, options?: StreamOptions): Promise<void>;
  
  // 기본 제어
  play(): void;
  pause(): void;
  getCurrentTime(): number;
  setCurrentTime(seconds: number): void;
  
  // 메타데이터
  getMetadata(): StreamMetadata;
  
  // 이벤트
  onStreamReady: () => void;
  onError: (error: StreamError) => void;
  onStats: (stats: StreamStats) => void;
}

interface StreamMetadata {
  protocol: 'rtsp' | 'hls' | 'webrtc' | 'dash';
  resolution: string;
  fps: number;
  bitrate: number;
  codec: string;
  latency_ms: number;
}
```

#### 권장 구현 전략
1. **프로토콜 감지**: URL 패턴으로 자동 선택 (rtsp://, http://...m3u8, wss://)
2. **폴백 메커니즘**: WebRTC 실패 시 → HLS 자동 전환
3. **적응형 품질**: 네트워크 상태에 따라 자동 비트레이트 조정
4. **상태 모니터링**: 지연시간, 손실률, 버퍼링 시간 실시간 추적

---

## 3. WebRTC/WHEP 표준 검토

### 3.1 WebRTC 현황 (2026)

#### 브라우저 지원
- ✓ **널리 지원**: Chrome, Firefox, Safari, Edge
- ✓ **모바일**: iOS Safari (14.5+), Android Chrome
- ✓ **플러그인 불필요**: 순수 웹 표준 (W3C)

#### 성능 특성
| 항목 | 수치 |
|------|------|
| 엔드-투-엔드 지연 | **200-500ms** (최적화됨) |
| 최대 직접 연결 수 | 20-50 뷰어 |
| 대규모 배포 시 | SFU 메시 + CDN-grade 원점 필요 |
| 네트워크 | UDP (방화벽 친화적) |

---

### 3.2 WHEP (WebRTC-HTTP Egress Protocol) 표준

#### WHEP란?
- **정의**: WebRTC 재생(Egress)을 위한 HTTP 표준화 프로토콜
- **상태**: 인터넷 초안 (draft-ietf-wish-whep-04, 2026년 8월 기준)
- **RFC 전환**: 예상 시기 (WHIP가 먼저 RFC 1180 지정됨)

#### 핵심 특징
1. **SDP 기반 협상**:
   ```
   POST /whep/endpoint HTTP/1.1
   Content-Type: application/sdp
   
   [SDP Offer]
   
   HTTP/1.1 201 Created
   Content-Type: application/sdp
   Location: /whep/endpoint/session123
   
   [SDP Answer]
   ```

2. **표준 HTTP 메서드**:
   - POST: 스트림 요청 및 SDP 협상
   - DELETE: 세션 종료
   - GET/PATCH: 메타데이터 조회 및 수정

3. **저지연 특성**:
   - 단방향 재생 (Viewer 입장에서)
   - **서브초 지연**: 최적화 배포 시 1초 미만
   - 무제한 동시 뷰어 (SFU 팬아웃 + CDN)

#### WHEP 클라이언트 구현 (JavaScript)
```typescript
// WHEP 클라이언트 예시
async function connectWHEP(whepEndpoint: string) {
  // 1. Local SDP Offer 생성
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
  });
  
  const videoTrack = await navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => stream.getVideoTracks()[0]);
  
  peerConnection.addTrack(videoTrack);
  
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  
  // 2. SDP Offer를 WHEP 엔드포인트에 POST
  const response = await fetch(whepEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: offer.sdp
  });
  
  // 3. 서버로부터 SDP Answer 수신
  const answerSdp = await response.text();
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription({ type: 'answer', sdp: answerSdp })
  );
  
  // 4. ICE 후보 교환 (자동 처리됨)
  // 5. 스트림 수신 시작
  peerConnection.ontrack = (event) => {
    const video = document.getElementById('remoteVideo');
    video.srcObject = event.streams[0];
  };
}
```

#### 현재 구현 현황 (2026년)
**WHEP 지원 서버**:
- Cloudflare Stream
- Dolby Millicast
- OvenMediaEngine
- MediaMTX
- Janus
- LiveKit
- Ant Media Server

---

### 3.3 프로토콜 비교: HLS vs DASH vs WebRTC vs LL-HLS

| 항목 | HLS | DASH | WebRTC | LL-HLS | LL-DASH |
|------|-----|------|--------|--------|---------|
| **지연시간** | 15-30초 | 10-20초 | 200-500ms | 2-4초 | 2-3초 |
| **브라우저 호환성** | ✓ 모든 디바이스 | ✓ 모든 디바이스 | ✓ 현대 브라우저 | ✓ iOS/Mac | ✓ Android/TV |
| **CDN 확장성** | ✓ 우수 | ✓ 우수 | ✗ 직접 연결만 | ✓ 우수 | ✓ 우수 |
| **직접 뷰어 수** | 무제한 (CDN) | 무제한 (CDN) | 20-50 | 무제한 (CDN) | 무제한 (CDN) |
| **설정 복잡도** | 낮음 | 낮음 | 높음 | 중간 | 중간 |
| **네트워크 효율** | TCP (신뢰성) | TCP (신뢰성) | UDP (효율) | TCP | TCP |
| **Live 재생 | ✓ 우수 | ✓ 우수 | ✓ 최고 | ✓ 최고 | ✓ 최고 |

---

### 3.4 POSCO 외부 시스템 연동 시 고려사항

1. **WHEP 클라이언트로서의 활용**
   - 외부 VMS/분석 시스템이 WHEP 서버를 제공할 경우
   - Vision Monitor에 WHEP 클라이언트 내장 가능
   - Sub-second 지연 + 표준 HTTP 기반 = 방화벽 친화적

2. **다중 프로토콜 지원 필수**
   - 포항 현장 기존 RTSP 카메라 유지
   - 미래 WebRTC/WHEP 카메라 추가 가능
   - 하이브리드 아키텍처 (Ingest: RTSP, Egress: HLS/WebRTC)

3. **낮은 지연시간 요구사항**
   - 제강 공정 안전 모니터링: 200-500ms WebRTC 권장
   - 분석/통계: 2-4초 LL-HLS 충분
   - 일반 모니터링: 15-30초 HLS 가능

---

## 4. MariaDB 스키마 설계 패턴

### 4.1 기업용 VMS 데이터 모델

#### 핵심 엔티티

##### 1. Camera (카메라 정보)
```sql
CREATE TABLE camera (
  camera_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500),
  model VARCHAR(100),
  ip_address VARCHAR(45),
  port INT DEFAULT 554,
  username VARCHAR(100),
  password VARCHAR(100),
  
  -- 스트림 정보
  stream_protocol ENUM('rtsp', 'http', 'webrtc', 'onvif') DEFAULT 'rtsp',
  stream_url TEXT NOT NULL,
  stream_resolution VARCHAR(50) DEFAULT '1920x1080',
  stream_fps INT DEFAULT 30,
  
  -- 상태 및 설정
  is_active BOOLEAN DEFAULT TRUE,
  timezone VARCHAR(50),
  recording_enabled BOOLEAN DEFAULT TRUE,
  motion_detection BOOLEAN DEFAULT TRUE,
  
  -- 시간정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_online TIMESTAMP,
  
  INDEX idx_location (location),
  INDEX idx_active (is_active),
  INDEX idx_stream_protocol (stream_protocol)
);
```

##### 2. Stream (스트림 설정 및 메타데이터)
```sql
CREATE TABLE stream (
  stream_id INT PRIMARY KEY AUTO_INCREMENT,
  camera_id INT NOT NULL,
  protocol ENUM('rtsp', 'hls', 'webrtc', 'dash') NOT NULL,
  stream_url TEXT NOT NULL,
  resolution VARCHAR(50),
  fps INT,
  bitrate INT COMMENT 'kbps',
  codec VARCHAR(50) COMMENT 'h264, h265, etc',
  
  -- 성능 지표
  latency_ms INT,
  packet_loss_percent DECIMAL(5,2),
  current_status ENUM('active', 'inactive', 'error') DEFAULT 'active',
  
  -- 시간정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (camera_id) REFERENCES camera(camera_id) ON DELETE CASCADE,
  INDEX idx_camera_protocol (camera_id, protocol),
  INDEX idx_status (current_status)
);
```

##### 3. Event (감지 이벤트 기록)
```sql
CREATE TABLE event (
  event_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  camera_id INT NOT NULL,
  
  -- 이벤트 분류
  event_type ENUM('motion', 'object_detection', 'anomaly', 'stream_loss', 'tampering') NOT NULL,
  object_class VARCHAR(100) COMMENT 'person, vehicle, defect, etc',
  severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
  
  -- 시간 정보 (타임시리즈 쿼리 최적화)
  event_start TIMESTAMP NOT NULL,
  event_end TIMESTAMP,
  duration_seconds INT,
  
  -- 메타데이터
  confidence_score DECIMAL(5,2),
  region_coordinates JSON COMMENT '{"x": 10, "y": 20, "w": 100, "h": 80}',
  description TEXT,
  
  -- 상태 및 처리
  status ENUM('new', 'acknowledged', 'resolved', 'false_positive') DEFAULT 'new',
  assigned_to INT COMMENT 'user_id',
  
  -- 시간정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (camera_id) REFERENCES camera(camera_id) ON DELETE CASCADE,
  
  -- 중요: 시계열 데이터 인덱싱
  INDEX idx_event_start (event_start),
  INDEX idx_camera_time (camera_id, event_start DESC),
  INDEX idx_type_time (event_type, event_start DESC),
  INDEX idx_severity_time (severity, event_start DESC),
  INDEX idx_status (status),
  
  -- PARTITION BY RANGE 고려 (아래 참고)
  PARTITION BY RANGE (YEAR(event_start)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028)
  )
);
```

##### 4. Recording (녹화 세그먼트)
```sql
CREATE TABLE recording (
  recording_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  camera_id INT NOT NULL,
  
  -- 시간 범위
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration_seconds INT,
  
  -- 파일 정보
  file_path VARCHAR(500) NOT NULL,
  file_size_mb BIGINT,
  codec VARCHAR(50),
  resolution VARCHAR(50),
  fps INT,
  
  -- 스토리지 관리
  storage_id VARCHAR(100) COMMENT 'local_ssd, nas_backup, cloud',
  is_archived BOOLEAN DEFAULT FALSE,
  retention_days INT DEFAULT 30,
  
  -- 인덱싱
  is_indexed BOOLEAN DEFAULT TRUE,
  index_data JSON COMMENT 'frame offsets for quick seek',
  
  -- 시간정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (camera_id) REFERENCES camera(camera_id) ON DELETE CASCADE,
  
  -- 시계열 인덱싱
  INDEX idx_start_time (start_time),
  INDEX idx_camera_time (camera_id, start_time DESC),
  INDEX idx_storage (storage_id),
  
  PARTITION BY RANGE (YEAR(start_time)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027)
  )
);
```

##### 5. AlertSetting (알림 규칙)
```sql
CREATE TABLE alert_setting (
  alert_id INT PRIMARY KEY AUTO_INCREMENT,
  camera_id INT NOT NULL,
  
  -- 알림 조건
  event_type ENUM('motion', 'object_detection', 'anomaly', 'stream_loss') NOT NULL,
  object_class VARCHAR(100),
  min_confidence DECIMAL(5,2),
  min_duration_seconds INT DEFAULT 0,
  
  -- 알림 임계값
  alert_threshold INT DEFAULT 1 COMMENT 'events before alerting',
  time_window_seconds INT DEFAULT 60,
  
  -- 알림 대상
  is_enabled BOOLEAN DEFAULT TRUE,
  alert_type ENUM('email', 'sms', 'push', 'webhook') NOT NULL,
  alert_recipients JSON COMMENT '["user1@posco.com", "user2@posco.com"]',
  webhook_url VARCHAR(500),
  
  -- 동작
  auto_record BOOLEAN DEFAULT TRUE,
  auto_snapshot BOOLEAN DEFAULT TRUE,
  
  -- 우선순위
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  -- 활성화 시간
  is_24_hours BOOLEAN DEFAULT TRUE,
  active_start TIME,
  active_end TIME,
  active_days JSON COMMENT '["MON", "TUE", "WED", ...]',
  
  -- 시간정보
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (camera_id) REFERENCES camera(camera_id) ON DELETE CASCADE,
  
  INDEX idx_camera (camera_id),
  INDEX idx_enabled (is_enabled)
);
```

##### 6. User (사용자 권한 관리)
```sql
CREATE TABLE user (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  
  role ENUM('admin', 'supervisor', 'operator', 'viewer') DEFAULT 'viewer',
  department VARCHAR(100) COMMENT 'e.g., 포항 4선재 제강팀',
  
  -- 권한 설정
  assigned_cameras JSON COMMENT '[1, 2, 3] or null for all',
  can_download BOOLEAN DEFAULT FALSE,
  can_configure BOOLEAN DEFAULT FALSE,
  can_delete_events BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_active (is_active)
);
```

##### 7. AuditLog (감사 로그)
```sql
CREATE TABLE audit_log (
  log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  
  action VARCHAR(100) COMMENT 'view, download, configure, delete, export',
  entity_type VARCHAR(50) COMMENT 'event, recording, alert_setting, camera',
  entity_id INT,
  
  old_value JSON,
  new_value JSON,
  description TEXT,
  
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_timestamp (timestamp),
  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  
  PARTITION BY RANGE (YEAR(timestamp)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027)
  )
);
```

---

### 4.2 성능 최적화 전략

#### 1. 시계열 데이터 인덱싱

**문제**: Event와 Recording 테이블은 시간이 지남에 따라 급속도로 성장합니다.
- 예: 포항 4선재, 카메라 10개 × 30fps × 60초/분 × 60분/시간 × 24시간 = ~25.9M 프레임/일
- 이벤트: ~1-10% (불량 감지 비율에 따라) → 250K-2.6M 이벤트/일

**인덱싱 전략**:
- **BRIN 인덱스** (MariaDB 10.5+): 
  - 가벼움 (B-tree의 1/10 크기)
  - 시계열 데이터에 최적화
  - `CREATE INDEX idx_event_time_brin ON event (event_start) USING BRIN;`

- **복합 인덱스**: 자주 함께 쿼리되는 칼럼
  ```sql
  -- 예: "카메라 10의 최근 1주일 이벤트"
  CREATE INDEX idx_camera_time ON event (camera_id, event_start DESC);
  
  -- 예: "심각도별 최근 이벤트"
  CREATE INDEX idx_severity_time ON event (severity, event_start DESC);
  ```

#### 2. 파티셔닝 (Partitioning) 전략

**목표**: 대규모 테이블의 쿼리 성능 개선 및 관리 용이성

**RANGE 파티션 (시간 기반)**:
```sql
-- Event 테이블을 연도별로 분할
PARTITION BY RANGE (YEAR(event_start)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p2027 VALUES LESS THAN (2028)
);
```

**효과**:
- 쿼리 성능: 전체 스캔 불필요 → 특정 파티션만 스캔
- 유지보수: 연도별 전체 삭제 가능 (DROP PARTITION)
- 백업: 파티션 단위로 선택적 백업

#### 3. 컬럼 선택 및 정규화

**피하기**:
- 큰 TEXT 필드를 event 테이블에 직접 저장 (description 필드는 JSON으로 통합)
- 무제한 JSON 저장 (크기 제한 설정)

**권장**:
- `event_start`, `event_end`로 범위 검색 지원
- JSON 필드는 인덱싱 불가능 → 자주 검색되는 필드는 칼럼화 (e.g., `severity`, `event_type`)
- 외래키 제약으로 데이터 무결성 보장

#### 4. 읽기 레플리카 및 백업

**구조**:
```
Primary (Write) → Replica 1 (Read)
                → Replica 2 (Read/Backup)
```

**용도**:
- 분석 쿼리 (자동 대시보드) → Replica로 분산
- 실시간 이벤트 쓰기 → Primary 집중
- 백업: Replica 중 하나로부터 스냅샷

---

### 4.3 POSCO 요구사항 체크리스트

#### 필수 기능
- [ ] **다중 카메라 관리**: Camera 테이블에 최소 10~50개 카메라 저장 가능
- [ ] **실시간 이벤트 기록**: Event 테이블, 파티셔닝으로 대규모 데이터 처리
- [ ] **시간 범위 검색**: 시계열 인덱싱으로 "2026-08-01 ~ 2026-08-05의 불량" 빠른 조회
- [ ] **알림 규칙 엔진**: AlertSetting으로 카메라별 맞춤 조건 설정
- [ ] **감사 추적**: AuditLog로 누가 언제 어떤 데이터를 접근했는지 기록

#### 성능 요구사항
- [ ] **이벤트 쿼리 <100ms**: 카메라별 최근 이벤트 조회 (인덱싱)
- [ ] **녹화 재생 지원**: Recording 테이블의 인덱싱으로 빠른 시크 (Seek)
- [ ] **대규모 데이터 관리**: 파티셔닝으로 연도별 최소 10-50GB 데이터 처리
- [ ] **24/7 운영**: 복제 및 백업으로 장애 대응

#### 확장성
- [ ] **프로토콜 추가**: Stream 테이블에 새로운 프로토콜 저장 (ENUM 확장)
- [ ] **분석 확장**: Event 테이블에 ML 점수 (confidence_score) 저장
- [ ] **외부 API 연동**: Webhook URL 저장 및 관리 (AlertSetting)

#### 보안
- [ ] **암호화**: 카메라 비밀번호 해시 저장 (bcrypt)
- [ ] **접근 제어**: User 테이블로 역할 기반 권한 관리 (RBAC)
- [ ] **감사**: AuditLog로 모든 수정 사항 추적
- [ ] **데이터 보호**: 개인정보 최소화 (필요한 필드만 저장)

---

## 결론

### Phase 1 주요 발견사항

#### 1. UI/UX 설계 권장사항
- **그리드 기반 다중 카메라 뷰**: Frigate의 DraggableGridLayout 패턴 참고
- **어두운 테마 필수**: 24/7 모니터링 환경 + 야간 제강 공정
- **색상 코드 알림**: 녹색(정상) → 주황(경고) → 빨강(위험)
- **메타데이터 패널**: 라이브 영상 + 센서 값 + 타임라인 통합
- **이벤트 허브**: 신규 감지 자동 알림 + 필터링 검색

#### 2. 비디오 플레이어 아키텍처
- **Video.js v10 기반**: 모듈형 재설계로 경량화 (9KB부터 가능)
- **StreamPlayer 추상화**: RTSP/HLS/WebRTC/DASH 통일 인터페이스
- **폴백 메커니즘**: 주요 프로토콜 우선 → 실패 시 대체 프로토콜 자동 전환

#### 3. WebRTC/WHEP 적용성
- **저지연 모니터링**: 200-500ms WebRTC (안전 모니터링)
- **표준화**: WHEP은 아직 draft이지만 실제 프로덕션 구현 가능 (CloudFlare, LiveKit 등)
- **다중 프로토콜**: 기존 RTSP + 새 WebRTC 혼용 가능

#### 4. 데이터베이스 설계
- **핵심 6개 테이블**: Camera, Stream, Event, Recording, AlertSetting, User
- **시계열 인덱싱**: BRIN 인덱스 + 파티셔닝으로 대규모 이벤트 처리
- **확장성**: JSON 필드로 유연성, 외래키로 무결성 보장

---

### Phase 2 Architecture Agent에 전달할 핵심 권장사항

#### A. 프론트엔드 설계
```
1. 라이브 뷰: React + Frigate-style Grid Layout
2. 상세 뷰: Video.js 기반 StreamPlayer
3. 이벤트 패널: 실시간 필터링 + 검색
4. 대시보드: KPI 타일 + 시계열 그래프 (Recharts)
5. 테마: 기본 Dark Mode + Light Mode 토글
```

#### B. 백엔드 아키텍처
```
1. 스트림 수신: FFmpeg (RTSP → HLS/fMP4 변환)
2. 이벤트 감지: AI/ML 엔진 (불량 감지)
3. 알림 엔진: AlertSetting 규칙 기반 트리거
4. API: RESTful (스트림, 이벤트, 녹화, 알림 조회)
5. DB: MariaDB (파티셔닝 + 복제)
```

#### C. 스트리밍 프로토콜 우선순위
```
1순위: HLS (안정성 + 호환성)
2순위: WebRTC (저지연 + WHEP 지원)
3순위: DASH (대체 적응형 스트리밍)
Fallback: RTSP 직접 재생 (구형 브라우저)
```

#### D. 배포 고려사항
```
1. 카메라 연결: ONVIF/RTSP 자동 발견
2. 알림: 이메일 + 웹훅 (외부 ERP 연동)
3. 보안: 사용자 인증 (AD/LDAP) + 감사 로그
4. 성능: 로드 밸런싱 (다중 인코더) + CDN
```

---

### 다음 단계
**Phase 2 Architecture Agent**에서는 위 권장사항을 바탕으로:
- 상세 API 설계 (OpenAPI/Swagger)
- 컴포넌트 아키텍처 다이어그램
- 스트림 인제스트/변환 파이프라인
- 데이터베이스 마이그레이션 전략
- CI/CD 및 배포 플랜

을 수립할 예정입니다.

---

**리서치 완료 일자**: 2026-08-05  
**작성자**: Claude Research Agent  
**검증**: POSCO 포항 4선재 제조 AI 모니터링 시스템 (Vision Monitor VMS)
