# Vision Monitor VMS - 시스템 아키텍처 & 상세 설계 (Phase 2)

**작성일**: 2026-08-05  
**고객**: POSCO 포항 4선재  
**기술 스택**: React 19 + Spring Boot 3.x + MariaDB  
**상태**: Phase 2 아키텍처 설계 완료 → Phase 3 구현 준비 완료

---

## 1. 시스템 아키텍처 개요

### 1.1 전체 시스템 아키텍처 다이어그램

```
┌──────────────────────────────────────────────────────────────────────┐
│                      POSCO 포항 4선재 현장                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  CCTV 카메라 (10~50개) + 센서 (온도, 속도, 부하 등)          │ │
│  │  RTSP/ONVIF 인터페이스                                        │ │
│  └────────┬───────────────────────────────────────────────────┬──┘ │
│           │                                                   │     │
└───────────┼───────────────────────────────────────────────────┼─────┘
            │                                                   │
┌───────────▼─────────────────────────────────────────────────▼──────┐
│                   Vision Monitor VMS 시스템                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Frontend Layer (React 19 + Vite)                          │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐ │   │
│  │  │ Live View   │  │ Camera Detail│  │ Timeline Playback │ │   │
│  │  │ (Grid 2x2~  │  │ (Full Screen)│  │ (Scrubber)        │ │   │
│  │  │  4x4)       │  │              │  │                   │ │   │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │ Event Dashboard │ Settings │ KPI Dashboard             │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                                                               │   │
│  │  [상태 관리: Redux Toolkit / Zustand]                        │   │
│  │  [스타일: Tailwind CSS + CSS Modules]                       │   │
│  │  [API 클라이언트: Axios with Interceptors]                  │   │
│  └─────────────────────────────┬────────────────────────────────┘   │
│                                 │ REST API (JSON)                    │
│  ┌──────────────────────────────▼────────────────────────────────┐  │
│  │  Backend Layer (Spring Boot 3.x)                             │  │
│  │  ┌──────────────────────────────────────────────────────────┐│  │
│  │  │ REST Controller Layer                                   ││  │
│  │  │ • CameraController (CRUD, Metadata)                     ││  │
│  │  │ • StreamController (Stream Info, Health)                ││  │
│  │  │ • EventController (Query, Filter, Timeline)             ││  │
│  │  │ • RecordingController (Search, Playback)                ││  │
│  │  │ • AlertSettingController (Rules Management)             ││  │
│  │  │ • HealthCheckController (System Status)                 ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  │                           ▲                                   │  │
│  │  ┌──────────────────────────┴───────────────────────────────┐│  │
│  │  │ Service Layer (비즈니스 로직)                            ││  │
│  │  │ • CameraService (카메라 관리)                            ││  │
│  │  │ • StreamService (스트림 프로토콜 선택, 헬스 체크)        ││  │
│  │  │ • EventService (이벤트 필터링, 통계)                    ││  │
│  │  │ • RecordingService (녹화 검색, 스트림 변환)              ││  │
│  │  │ • AlertService (알림 규칙 평가, 트리거)                 ││  │
│  │  │ • UserService (인증, 권한 검증)                         ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  │                           ▲                                   │  │
│  │  ┌──────────────────────────┴───────────────────────────────┐│  │
│  │  │ Middleware Layer (외부 연동)                             ││  │
│  │  │ • RTSP Ingest (FFmpeg wrapper)                           ││  │
│  │  │ • L2/EAI Adapter (TCP/Socket 통신)                       ││  │
│  │  │ • Webhook Dispatcher (Alert 전송)                        ││  │
│  │  │ • SSE Manager (Real-time Events)                         ││  │
│  │  │ • FFmpeg Transcoding (HLS/WebRTC 변환)                   ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  │                           ▲                                   │  │
│  │  ┌──────────────────────────┴───────────────────────────────┐│  │
│  │  │ Repository Layer (Data Access, JPA)                      ││  │
│  │  │ • CameraRepository (CrudRepository)                       ││  │
│  │  │ • StreamRepository (+ Custom @Query)                      ││  │
│  │  │ • EventRepository (Specifications for Complex Query)      ││  │
│  │  │ • RecordingRepository (Time-range Search)                 ││  │
│  │  │ • AlertSettingRepository                                  ││  │
│  │  │ • UserRepository                                          ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  │                                                               │  │
│  │  [설정: DataSource, JPA Config, Logging (SLF4J + Logback)]  │  │
│  │  [보안: Spring Security + JWT, CORS]                        │  │
│  │  [캐싱: Spring Cache (Redis 선택사항)]                      │  │
│  └─────────────────────────────┬────────────────────────────────┘  │
│                                 │ JDBC / SQL                        │
│  ┌──────────────────────────────▼────────────────────────────────┐  │
│  │  Database Layer (MariaDB 10.5+)                              │  │
│  │  ┌──────────────────────────────────────────────────────────┐│  │
│  │  │ Tables (7개):                                            ││  │
│  │  │ • camera (카메라 정보, 메타데이터)                       ││  │
│  │  │ • stream (스트림 설정, 프로토콜별 URL)                   ││  │
│  │  │ • event (감지 이벤트, 시계열 파티션)                     ││  │
│  │  │ • recording (녹화 파일 인덱싱, 시계열 파티션)            ││  │
│  │  │ • alert_setting (알림 규칙)                              ││  │
│  │  │ • user (사용자, 권한)                                    ││  │
│  │  │ • audit_log (감사 로그, 시계열 파티션)                   ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  │                                                               │  │
│  │  [인덱싱: BRIN (시계열) + 복합 인덱스]                      │  │
│  │  [파티셔닝: RANGE (연도별)]                                 │  │
│  │  [복제: Primary + 읽기 Replica]                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Storage & Streaming Infrastructure                         │   │
│  │  ┌──────────────────┐  ┌─────────────┐  ┌──────────────────┐│   │
│  │  │ HLS Segmenter    │  │ FFmpeg      │  │ WebRTC Server    ││   │
│  │  │ (.ts/.mp4 생성)  │  │ (변환)      │  │ (SFU/WHEP)       ││   │
│  │  └──────────────────┘  └─────────────┘  └──────────────────┘│   │
│  │  ┌──────────────────┐  ┌─────────────────────────────────────┤   │
│  │  │ Local Storage    │  │ 녹화 파일 + Index (빠른 시크)       ││   │
│  │  │ /data/recordings │  │                                      ││   │
│  │  └──────────────────┘  └─────────────────────────────────────┤   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

└─────────────────────────────────────────────────────────┬─────────────┘
                                                           │
                    ┌─────────────────────────────────────┴──────────┐
                    │                                                 │
            ┌───────▼────────┐                      ┌────────────────▼──┐
            │ POSCO L2/EAI    │                      │ 외부 시스템 (선택) │
            │ System (TCP)    │                      │ • Email Server    │
            └─────────────────┘                      │ • SMS Gateway     │
                                                     │ • Slack/Teams     │
                                                     │ • Analytics       │
                                                     └───────────────────┘
```

---

### 1.2 아키텍처 레이어별 책임

#### Frontend Layer (React 19)
- **역할**: 사용자 인터페이스, 상태 관리, API 통신
- **기술**:
  - **상태 관리**: Redux Toolkit (또는 Zustand)
  - **스타일**: Tailwind CSS + CSS Modules
  - **번들러**: Vite (빠른 개발, 최적화 빌드)
  - **API 클라이언트**: Axios with interceptors (재시도, 토큰 갱신)
  - **타입**: TypeScript (strict mode)
  - **폼 검증**: Zod 또는 Yup
  
- **책임 범위**:
  - 라이브 그리드 뷰 렌더링
  - 스트림 플레이어 컴포넌트 (StreamPlayer 추상화)
  - 이벤트 실시간 업데이트 (SSE/WebSocket)
  - 로컬 레이아웃 저장 (localStorage)
  - 사용자 인증 토큰 관리

#### Backend Layer (Spring Boot 3.x)
- **역할**: API 제공, 비즈니스 로직, 외부 시스템 연동
- **기술**:
  - **프레임워크**: Spring Boot 3.x
  - **ORM**: Spring Data JPA + Hibernate
  - **마이그레이션**: Flyway
  - **로깅**: SLF4J + Logback
  - **API 문서**: Springdoc OpenAPI (Swagger UI)
  - **테스트**: JUnit 5, Mockito, TestContainers
  
- **책임 범위**:
  - RESTful API 엔드포인트 제공
  - 비즈니스 로직 실행 (이벤트 필터링, 통계)
  - 데이터베이스 트랜잭션 관리
  - 사용자 인증 & 권한 검증 (Spring Security)
  - 실시간 이벤트 스트림 (SSE)
  - 외부 시스템 연동 (L2/EAI)

#### Middleware Layer
- **역할**: 카메라 스트림 수신, 변환, 전송
- **구성 요소**:
  - **RTSP Ingest**: FFmpeg 기반 RTSP 수신 및 변환
  - **HLS Segmenter**: 라이브 스트림을 HLS로 변환 (.ts 세그먼트)
  - **WebRTC Server**: SFU (Selective Forwarding Unit) 또는 WHEP 엔드포인트
  - **Webhook Dispatcher**: 알림 이메일/SMS 전송
  - **SSE Manager**: 클라이언트에 실시간 이벤트 전송

#### Database Layer (MariaDB)
- **역할**: 데이터 저장소, 쿼리 최적화
- **특징**:
  - **파티셔닝**: 시계열 데이터 (Event, Recording, AuditLog) RANGE 파티션
  - **인덱싱**: BRIN (시계열) + 복합 인덱스
  - **복제**: Primary (Write) + Replica (Read)
  - **백업**: 일일 스냅샷 + 증분 백업

---

## 2. Frontend 상세 아키텍처

### 2.1 디렉토리 구조
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/              # 공용 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── KPITile.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/              # 레이아웃 관리 (개인화 대시보드)
│   │   │   ├── LayoutTabs.tsx     (탭 기반 공정 분류)
│   │   │   ├── GridSelector.tsx   (그리드 크기 선택: 3x2, 3x3, 2x3)
│   │   │   ├── CameraGrid.tsx     (드래그 & 드롭 가능한 그리드)
│   │   │   └── CameraCell.tsx     (개별 셀, + 버튼)
│   │   ├── stream/              # 스트리밍 관련
│   │   │   ├── StreamPlayer.tsx (추상화 컴포넌트)
│   │   │   ├── HLSPlayer.tsx    (HLS 구현)
│   │   │   ├── WebRTCPlayer.tsx (WebRTC 구현)
│   │   │   └── StreamStats.tsx  (지연, FPS, 손실률)
│   │   ├── camera/
│   │   │   ├── CameraGrid.tsx   (라이브 그리드, 드래그 가능)
│   │   │   ├── CameraCard.tsx   (개별 카메라 타일)
│   │   │   └── CameraDetail.tsx (상세 뷰 패널)
│   │   ├── event/
│   │   │   ├── EventList.tsx    (이벤트 테이블)
│   │   │   ├── EventFilter.tsx  (필터 패널)
│   │   │   └── EventTimeline.tsx(이벤트 타임라인)
│   │   └── timeline/
│   │       ├── TimelineScrubber.tsx (시간 선택)
│   │       └── PlaybackControls.tsx (재생 제어)
│   ├── pages/
│   │   ├── LiveView.tsx         # 라이브 모니터링
│   │   ├── CameraDetailView.tsx # 카메라 상세 뷰
│   │   ├── TimelinePlayback.tsx # 타임라인 재생
│   │   ├── EventDashboard.tsx   # 이벤트 관리
│   │   ├── Settings.tsx         # 설정
│   │   └── NotFound.tsx
│   ├── hooks/
│   │   ├── useStream.ts         # 스트림 재생 로직
│   │   ├── useEvents.ts         # 이벤트 구독
│   │   ├── useCameras.ts        # 카메라 CRUD
│   │   ├── useLayout.ts         # 사용자 정의 레이아웃
│   │   └── useLocalStorage.ts   # 레이아웃 저장
│   ├── redux/
│   │   ├── slices/
│   │   │   ├── cameraSlice.ts   (카메라 상태)
│   │   │   ├── eventSlice.ts    (이벤트 상태)
│   │   │   ├── uiSlice.ts       (UI 상태: 레이아웃, 필터)
│   │   │   └── authSlice.ts     (인증 상태)
│   │   └── store.ts
│   ├── api/
│   │   ├── client.ts            # Axios 인스턴스
│   │   ├── cameraApi.ts         # Camera API 호출
│   │   ├── streamApi.ts         # Stream API 호출
│   │   ├── eventApi.ts          # Event API 호출
│   │   └── recordingApi.ts      # Recording API 호출
│   ├── types/
│   │   └── index.ts             # 타입 정의 (API 응답 등)
│   ├── utils/
│   │   ├── dateUtils.ts         # 날짜 포매팅
│   │   ├── streamProtocol.ts    # 프로토콜 감지
│   │   └── errorHandler.ts      # 에러 처리
│   ├── styles/
│   │   ├── globals.css          # 전역 스타일
│   │   ├── theme.css            # 다크/라이트 테마
│   │   └── components.module.css
│   ├── App.tsx                  # 라우팅
│   └── main.tsx                 # 엔트리 포인트
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 2.2 상태 관리 (Redux Toolkit 기준)

#### Store 구조
```typescript
{
  cameras: {
    list: Camera[],
    selected: Camera | null,
    loading: boolean,
    error: string | null
  },
  streams: {
    byCamera: { [cameraId: number]: Stream[] },
    current: { [cameraId: number]: StreamPlayer },
    health: { [streamId: number]: StreamStats }
  },
  events: {
    list: Event[],
    filters: { cameraId?, type?, severity?, timeRange? },
    pagination: { page, pageSize, total },
    real_time_updates: boolean
  },
  ui: {
    currentPage: 'live' | 'detail' | 'timeline' | 'events' | 'settings',
    gridLayout: 'auto' | '2x2' | '3x3' | '4x4',
    sidebarVisible: boolean,
    theme: 'dark' | 'light'
  },
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean
  }
}
```

### 2.3 API 통신 패턴

#### Axios 인터셉터
```typescript
// client.ts
const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000
});

// 요청 인터셉터: 토큰 자동 첨부
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 토큰 갱신, 에러 처리
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 시도
      const newToken = await refreshToken();
      localStorage.setItem('auth_token', newToken);
      // 원본 요청 재시도
    }
    return Promise.reject(error);
  }
);
```

#### SSE (Server-Sent Events) 실시간 업데이트
```typescript
// useEvents.ts
useEffect(() => {
  const eventSource = new EventSource(
    `/api/events/stream?cameraId=${selectedCameraId}`
  );
  
  eventSource.onmessage = (event) => {
    const newEvent = JSON.parse(event.data);
    dispatch(addEventToList(newEvent));
    // 실시간 알림 토스트
  };
  
  return () => eventSource.close();
}, [selectedCameraId]);
```

---

## 3. Backend 상세 아키텍처

### 3.1 디렉토리 구조
```
backend/
├── src/main/java/com/posco/visionmonitor/
│   ├── VisionMonitorApplication.java
│   ├── controller/
│   │   ├── CameraController.java
│   │   ├── StreamController.java
│   │   ├── EventController.java
│   │   ├── RecordingController.java
│   │   ├── AlertSettingController.java
│   │   ├── LayoutController.java (사용자 정의 레이아웃)
│   │   ├── HealthController.java
│   │   └── AuthController.java
│   ├── service/
│   │   ├── CameraService.java
│   │   ├── StreamService.java
│   │   ├── EventService.java
│   │   ├── RecordingService.java
│   │   ├── AlertService.java
│   │   ├── UserService.java
│   │   ├── LayoutService.java (사용자 정의 레이아웃 관리)
│   │   └── SseService.java (실시간 이벤트)
│   ├── repository/
│   │   ├── CameraRepository.java
│   │   ├── StreamRepository.java
│   │   ├── EventRepository.java
│   │   ├── RecordingRepository.java
│   │   ├── AlertSettingRepository.java
│   │   ├── UserRepository.java
│   │   ├── LayoutRepository.java
│   │   └── AuditLogRepository.java
│   ├── entity/
│   │   ├── Camera.java
│   │   ├── Stream.java
│   │   ├── Event.java
│   │   ├── Recording.java
│   │   ├── AlertSetting.java
│   │   ├── User.java
│   │   ├── AuditLog.java
│   │   └── Layout.java (사용자 정의 그리드 레이아웃)
│   ├── dto/
│   │   ├── CameraDTO.java
│   │   ├── StreamDTO.java
│   │   ├── EventDTO.java
│   │   ├── RecordingDTO.java
│   │   ├── AlertSettingDTO.java
│   │   └── ApiResponse.java
│   ├── middleware/
│   │   ├── RtspIngestService.java (FFmpeg 래퍼)
│   │   ├── HlsSegmenter.java
│   │   ├── WebRtcServer.java
│   │   ├── L2EaiAdapter.java (TCP 통신)
│   │   ├── WebhookDispatcher.java
│   │   └── FfmpegTranscoder.java
│   ├── config/
│   │   ├── DataSourceConfig.java
│   │   ├── JpaConfig.java
│   │   ├── SecurityConfig.java
│   │   ├── WebConfig.java (CORS)
│   │   ├── CacheConfig.java (Redis)
│   │   └── LoggingConfig.java
│   ├── security/
│   │   ├── JwtProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── SecurityContextHolder.java
│   ├── exception/
│   │   ├── VisionMonitorException.java
│   │   ├── StreamNotFoundException.java
│   │   ├── UnauthorizedException.java
│   │   └── GlobalExceptionHandler.java
│   └── util/
│       ├── DateUtils.java
│       ├── StreamProtocolDetector.java
│       └── FfmpegUtils.java
├── src/main/resources/
│   ├── application.yml         # 공통 설정
│   ├── application-dev.yml     # 개발 환경
│   ├── application-prod.yml    # 운영 환경
│   ├── db/migration/
│   │   └── V001__init.sql      # Flyway 마이그레이션
│   └── logback-spring.xml
├── pom.xml (또는 build.gradle)
└── README.md
```

### 3.2 핵심 Service 구현 예시

#### EventService (이벤트 필터링 & 통계)
```java
@Service
@Transactional(readOnly = true)
public class EventService {
  
  @Autowired
  private EventRepository eventRepository;
  
  // 필터링된 이벤트 조회
  public Page<EventDTO> searchEvents(
      Integer cameraId,
      String eventType,
      String severity,
      LocalDateTime startTime,
      LocalDateTime endTime,
      Pageable pageable
  ) {
    Specification<Event> spec = Specification
        .where(cameraIdEqual(cameraId))
        .and(typeEqual(eventType))
        .and(severityEqual(severity))
        .and(timeRangeBetween(startTime, endTime));
    
    return eventRepository.findAll(spec, pageable)
        .map(this::toDTO);
  }
  
  // 카메라별 시간대별 이벤트 통계
  public List<EventStatDTO> getEventStats(
      Integer cameraId,
      LocalDateTime startTime,
      LocalDateTime endTime
  ) {
    return eventRepository.findStatsByHour(cameraId, startTime, endTime);
  }
  
  // 실시간 이벤트 생성 (AI 감지 결과)
  @Transactional
  public EventDTO createEvent(EventCreateRequest request) {
    Event event = new Event();
    event.setCamera(cameraService.getCamera(request.getCameraId()));
    event.setEventType(request.getEventType());
    event.setSeverity(request.getSeverity());
    event.setEventStart(LocalDateTime.now());
    event.setConfidenceScore(request.getConfidenceScore());
    
    // 알림 규칙 평가
    alertService.evaluateAlerts(event);
    
    // 실시간 브로드캐스트 (SSE)
    sseService.broadcastEvent(event);
    
    return toDTO(eventRepository.save(event));
  }
}
```

#### StreamService (프로토콜 선택 & 헬스 체크)
```java
@Service
public class StreamService {
  
  @Autowired
  private StreamRepository streamRepository;
  
  // 프로토콜별 적응형 선택
  public Stream getOptimalStream(Camera camera) {
    // 1. WebRTC 시도 (저지연)
    Stream webrtcStream = streamRepository.findByCamera_IdAndProtocol(
        camera.getId(), "webrtc"
    ).orElse(null);
    if (webrtcStream != null && isHealthy(webrtcStream)) {
      return webrtcStream;
    }
    
    // 2. HLS 폴백 (안정성)
    Stream hlsStream = streamRepository.findByCamera_IdAndProtocol(
        camera.getId(), "hls"
    ).orElse(null);
    if (hlsStream != null && isHealthy(hlsStream)) {
      return hlsStream;
    }
    
    // 3. 마지막 폴백: RTSP 직접 재생
    return streamRepository.findByCamera_IdAndProtocol(
        camera.getId(), "rtsp"
    ).orElse(null);
  }
  
  // 스트림 헬스 체크 (배경 작업)
  @Scheduled(fixedDelay = 30000) // 30초마다
  public void healthCheckAllStreams() {
    streamRepository.findAll().forEach(stream -> {
      boolean healthy = checkStreamHealth(stream);
      stream.setCurrentStatus(healthy ? "active" : "error");
      streamRepository.save(stream);
    });
  }
}
```

### 3.3 실시간 이벤트 (SSE) 구현

```java
@RestController
@RequestMapping("/api/events")
public class EventController {
  
  @Autowired
  private SseService sseService;
  
  // Server-Sent Events 엔드포인트
  @GetMapping("/stream")
  public SseEmitter stream(
      @RequestParam(required = false) Integer cameraId,
      @RequestParam(required = false) String severity
  ) {
    SseEmitter emitter = new SseEmitter(300000L); // 5분 타임아웃
    sseService.register(emitter, cameraId, severity);
    
    emitter.onCompletion(() -> sseService.deregister(emitter));
    emitter.onTimeout(() -> sseService.deregister(emitter));
    
    return emitter;
  }
}

@Service
public class SseService {
  
  private final Map<SseEmitter, EventFilter> emitters = 
      Collections.synchronizedMap(new HashMap<>());
  
  public void register(SseEmitter emitter, Integer cameraId, String severity) {
    emitters.put(emitter, new EventFilter(cameraId, severity));
  }
  
  public void broadcastEvent(Event event) {
    emitters.forEach((emitter, filter) -> {
      if (filter.matches(event)) {
        try {
          emitter.send(SseEmitter.event()
              .id(String.valueOf(event.getId()))
              .name("event")
              .data(toDTO(event))
              .reconnectTime(5000));
        } catch (IOException e) {
          emitters.remove(emitter);
        }
      }
    });
  }
}
```

---

## 4. 스트림 처리 파이프라인

### 4.1 라이브 스트리밍 흐름

```
RTSP Ingest (FFmpeg)
    ↓
┌─────────────────────────────────────┐
│ FFmpeg 프로세스 (카메라당 1개)       │
│ • RTSP 수신 (카메라 → 서버)         │
│ • 코덱 변환 (H.264 → H.264/H.265)   │
│ • 프로토콜 분기 (HLS + WebRTC)      │
└──┬──────────────────────┬───────────┘
   │                      │
   ▼                      ▼
HLS Segmenter      WebRTC SFU Server
   │                      │
   ├─ .m3u8 플레이리스트  └─ WHEP 엔드포인트
   └─ .ts 세그먼트         └─ ICE 후보

   ↓ (브라우저 HTTP)      ↓ (브라우저 WebRTC/UDP)
┌──────────────┐    ┌──────────────┐
│ HLS 클라이언트│    │WebRTC 클라이언트│
│ (15-30초)    │    │ (200-500ms)  │
└──────────────┘    └──────────────┘
```

### 4.2 타임라인 재생 흐름

```
사용자: 날짜/시간 선택
    ↓
Backend: Recording 테이블 쿼리
    ↓ (파일 경로 반환)
FFmpeg: 녹화 파일 → HLS 온디맨드 변환
    ↓
브라우저: HLS 플레이어로 재생
    ↓
스크러빙: 타임스탐프 → FFmpeg 시크 (프레임 인덱스 활용)
```

### 4.3 알림 & 이벤트 흐름

```
AI 감지 시스템 또는 외부 API
    ↓ (POST /api/events)
Backend EventService
    ↓
1. Event 테이블에 저장
2. AlertService: 알림 규칙 평가
3. 조건 일치 → 웹훅 발송 (L2/EAI)
4. SSE 브로드캐스트 (실시간 클라이언트 알림)
    ↓
브라우저: 
  • 토스트 알림 표시
  • 이벤트 리스트 업데이트
  • 해당 카메라 강조 표시
```

---

## 5. 배포 및 운영

### 5.1 배포 환경 구성

#### 개발 (localhost)
- Frontend: `http://localhost:3000` (Vite dev server)
- Backend: `http://localhost:8080` (Spring Boot embedded Tomcat)
- Database: `localhost:3306` (MariaDB)
- Redis: `localhost:6379` (선택사항)

#### 스테이징/운영 (VM)
```
┌─────────────────────────────────────┐
│ Linux VM (POSCO 인프라)             │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Nginx (리버스 프록시 + 정적 서빙)│ │
│ │ :80, :443 (SSL/TLS)             │ │
│ │ └─ /api/* → :8080 (Backend)     │ │
│ │ └─ / → /var/www/frontend (SPA)  │ │
│ └─────────────────────────────────┘ │
│                 ▲                    │
│ ┌─────────────────────────────────┐ │
│ │ Spring Boot 3.x (서비스)         │ │
│ │ :8080 (내부 포트)                │ │
│ │ • 환경변수로 DB 연결 설정        │ │
│ │ • 로깅: /var/log/visionmonitor/  │ │
│ └─────────────────────────────────┘ │
│                 ▲                    │
│ ┌─────────────────────────────────┐ │
│ │ MariaDB (외부 또는 컨테이너)      │ │
│ │ :3306                           │ │
│ │ • 자동 백업 (일일)               │ │
│ │ • 복제 설정 (별도 Replica VM)    │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ FFmpeg 프로세스 (카메라별 1개)   │ │
│ │ • supervisor로 프로세스 관리     │ │
│ │ • 녹화 파일: /data/recordings/  │ │
│ │ • HLS 세그먼트: /data/hls/       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.2 배포 스크립트 (`deploy.sh`)

```bash
#!/bin/bash
set -e

# 환경 설정
DEPLOY_DIR="/opt/visionmonitor"
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
BACKEND_PORT=${BACKEND_PORT:-"8080"}

# 1. 빌드
echo "Building Frontend..."
cd frontend
npm run build
cd ..

echo "Building Backend..."
cd backend
mvn clean package -DskipTests
cd ..

# 2. 배포
echo "Deploying..."
mkdir -p $DEPLOY_DIR/{backend,frontend,data/{recordings,hls}}

# Frontend 배포
cp -r frontend/dist/* $DEPLOY_DIR/frontend/

# Backend 배포
cp backend/target/*.jar $DEPLOY_DIR/backend/app.jar

# 3. 데이터베이스 마이그레이션 (Flyway 자동)
echo "Running database migration..."
java -jar $DEPLOY_DIR/backend/app.jar --spring.profiles.active=migration

# 4. 서비스 재시작
echo "Restarting services..."
systemctl restart visionmonitor-backend
systemctl restart nginx

echo "Deployment completed!"
```

---

## 6. 보안 설계

### 6.1 인증 & 권한

#### JWT 기반 인증
```
사용자 로그인
    ↓
Backend: 사용자 검증 (비밀번호 해시 비교)
    ↓
JWT 토큰 발급 (유효기간 24시간)
    ↓
브라우저: localStorage에 토큰 저장
    ↓
이후 요청: Authorization 헤더에 토큰 첨부
    ↓
Backend: 토큰 검증 (공개키 서명 확인)
```

#### 역할 기반 접근 제어 (RBAC)
- **admin**: 모든 권한 (카메라 추가/삭제, 사용자 관리, 감사 로그 조회)
- **supervisor**: 카메라 모니터링, 알림 설정, 이벤트 확인
- **operator**: 라이브 모니터링, 녹화 재생만 가능
- **viewer**: 읽기 전용 (통계, 보고서)

### 6.2 데이터 보호

- **카메라 비밀번호**: bcrypt 해싱 저장
- **감사 로그**: 모든 접근 기록 (user_id, action, timestamp, IP)
- **HTTPS/TLS**: 모든 통신 암호화
- **SQL 인젝션 방지**: JPA 파라미터화된 쿼리 사용

---

## 7. 성능 & 확장성

### 7.1 데이터베이스 최적화

#### 인덱싱 전략
```sql
-- 시계열 데이터 (Event)
CREATE INDEX idx_event_start ON event (event_start);
CREATE INDEX idx_camera_time ON event (camera_id, event_start DESC);
CREATE INDEX idx_severity_time ON event (severity, event_start DESC);

-- 녹화 검색 (Recording)
CREATE INDEX idx_recording_time ON recording (start_time);
CREATE INDEX idx_recording_camera_time ON recording (camera_id, start_time DESC);

-- 감사 로그 (AuditLog)
CREATE INDEX idx_audit_timestamp ON audit_log (timestamp);
CREATE INDEX idx_audit_user ON audit_log (user_id);
```

#### 파티셔닝
- **Event, Recording, AuditLog**: RANGE (YEAR) 파티션
- 효과: 연도별로 separate 스토리지, 고속 쿼리

### 7.2 애플리케이션 성능

- **캐싱**: Spring Cache + Redis (선택사항)
  - Camera 메타데이터 (1시간 TTL)
  - AlertSetting 규칙 (10분 TTL)
  
- **연결 풀**: HikariCP (기본값 10-20 연결)

- **API 응답 최적화**:
  - 페이지네이션 (기본 20개/페이지)
  - 필드 필터링 (필요한 필드만 반환)
  - GZIP 압축

### 7.3 확장성 계획

#### 수평 확장 (Scale-Out)
- **Backend**: 무상태 설계 → 로드 밸런서 뒤 다중 인스턴스
- **Database**: Read Replica 추가 (분석 쿼리 분산)
- **스트리밍**: FFmpeg 프로세스 분산 (카메라별 전용 서버)

#### 수직 확장 (Scale-Up)
- CPU 코어 증가 (FFmpeg 병렬 처리)
- 메모리 증가 (버퍼링, 캐시)
- 스토리지 확장 (NAS 또는 클라우드)

---

## 8. 성공 기준 체크리스트

- [x] 시스템 전체 아키텍처 정의 (Frontend-Backend-DB 계층)
- [x] 컴포넌트 구조 및 책임 명확화
- [x] API 인터페이스 정의 (RESTful)
- [x] 데이터 흐름 (라이브, 타임라인, 이벤트, 알림)
- [x] 배포 환경 구성 (개발/스테이징/운영)
- [x] 보안 설계 (JWT, RBAC, 감사 로그)
- [x] 성능 최적화 전략 (인덱싱, 파티셔닝, 캐싱)
- [x] Phase 3 (Frontend/Backend Teams) 즉시 구현 가능

---

**작성 완료**: 2026-08-05  
**다음 단계**: Phase 3 구현 (Frontend Team, Backend Team 병렬 진행)  
**참고 자료**: `docs/RESEARCH.md`, `docs/API.md`, `docs/SCREENS.md`
