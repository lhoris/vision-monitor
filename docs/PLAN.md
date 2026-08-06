# Vision Monitor VMS - Agent Teams 기반 구현 계획서 (v2)

## 1. 프로젝트 개요

**프로젝트**: Vision Monitor VMS  
**목표**: 제조 공정의 CCTV 스트림을 수신하여 AI 기반 객체 탐지 오버레이를 적용하고, 웹 기반 VMS(Video Management System)로 시각화하는 통합 시스템

**핵심 기능**:
- 다중 CCTV 스트림 실시간 모니터링 (다중 카메라 그리드 뷰)
- AI 기반 객체 탐지 및 이벤트 알림
- 다양한 스트리밍 프로토콜 지원 (RTSP/HLS/WebRTC)
- 타임라인 기반 과거 영상 재생
- 카메라별 상세 설정 및 모니터링
- 실시간 알림 & 이벤트 추적

---

## 2. 기술 스택

### Frontend
- **Framework**: React 19 + TypeScript
- **상태관리**: Redux Toolkit 또는 Zustand
- **스타일**: CSS Modules + Tailwind CSS
- **비디오 플레이어**: StreamPlayer 추상화 클래스
  - `HLSPlayer` (Video.js)
  - `WebRTCPlayer` (WHEP 클라이언트)
  - `RTSPPlayer` (JSMpeg - 선택사항)
- **UI/UX**: 설계서 기반 기업용 VMS 스타일
- **빌드**: Vite

### Backend
- **Framework**: Spring Boot 3.x
- **Protocol**: REST API
- **Database**: MariaDB
- **미들웨어**: 간단한 Socket/TCP 통신 (L2/EAI 연동용)
- **스트리밍**: WebRTC 주소 제공받아 사용 (외부 시스템)

### DevOps
- **배포**: 기업 내부 VM (Linux/Windows)
- **배포 방식**: 쉘 스크립트 기반
- **컨테이너**: 선택사항 (필수 아님)
- **배포 자동화**: 간단한 배포 스크립트

---

## 3. 아키텍처

### 모놀리식 구조
```
vision-monitor/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── StreamPlayer/    # 비디오 플레이어 (추상화)
│   │   │   ├── Layout/          # 레이아웃
│   │   │   ├── Grid/            # 카메라 그리드
│   │   │   ├── CameraDetail/    # 상세 뷰
│   │   │   └── Common/          # 공통 컴포넌트
│   │   ├── pages/               # 페이지
│   │   │   ├── Live.tsx         # 라이브 모니터링
│   │   │   ├── Playback.tsx     # 재생
│   │   │   ├── Settings.tsx     # 설정
│   │   │   └── Events.tsx       # 이벤트 관리
│   │   ├── styles/              # 글로벌 스타일
│   │   ├── store/               # Redux/Zustand
│   │   ├── hooks/               # 커스텀 훅
│   │   ├── services/            # API 클라이언트
│   │   └── types/               # TypeScript 타입
│   └── package.json
│
├── backend/                     # Spring Boot 백엔드
│   ├── src/main/
│   │   ├── java/com/vision/
│   │   │   ├── entity/          # JPA 엔티티
│   │   │   ├── repository/      # Repository
│   │   │   ├── controller/      # REST Controller
│   │   │   ├── service/         # 서비스 로직
│   │   │   ├── middleware/      # L2/EAI 연동
│   │   │   ├── config/          # 설정
│   │   │   └── util/            # 유틸
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/
│   │           └── migration/   # 마이그레이션 (Flyway)
│   ├── pom.xml
│   └── scripts/                 # 배포 쉘 스크립트
│
└── docs/                        # 문서
    ├── RESEARCH.md              # 리서치 결과
    ├── ARCHITECTURE.md          # 아키텍처 설계
    └── API.md                   # REST API 명세

```

---

## 4. 데이터 모델 (MariaDB)

```sql
-- 주요 테이블
Cameras (id, name, location, zone, status, created_at)
Streams (id, camera_id, stream_url, type, resolution, fps)
Recordings (id, camera_id, start_time, end_time, file_path)
Events (id, camera_id, event_type, severity, timestamp, details)
AlertSettings (id, camera_id, event_type, enabled, threshold)
Layouts (id, user_id, tab_name, grid_config JSON, camera_positions JSON, created_at, updated_at)  -- 개인화 그리드용
```

---

## 5. 핵심 원칙 (Guiding Principles)

### 1. 요구사항 변화에 신속 대응
- 느슨한 결합, 높은 응집도
- 모듈 간 의존성 최소화
- StreamPlayer 추상화 → 새로운 프로토콜 추가 용이

### 2. 높은 유지보수성
- 명확한 파일 소유권 (Agent별)
- 자기 설명적 코드
- 최소한의 magic number

### 3. 신뢰할 수 있는 구현
- 테스트 가능한 설계
- 코드 리뷰 용이성 (Agent 간)
- 스테이징에서 충분한 검증

### 4. 빠른 피드백 루프
- 일일 통합 빌드
- 주간 고객 데모
- 변경사항 추적 가능

---

## 6. Agent Teams 구성

### Phase 1: 리서치 & 설계 (순차, 2주)

1. **Research Agent** (1명)
   - 기업용 VMS UI/UX 스타일 분석 (ZoneMinder, Frigate, VIGI 등)
   - Video.js + StreamPlayer 아키텍처 분석
   - WebRTC/WHEP 표준 검토
   - MariaDB 스키마 설계 패턴
   - 결과: `RESEARCH.md`

2. **Architecture & Design Agent** (1명)
   - 시스템 전체 설계
   - REST API 스펙 정의
   - MariaDB 스키마 설계
   - 설계서 기반 화면 구성 정리
   - 배포 전략 수립
   - 결과: `ARCHITECTURE.md`, `API.md`, 화면 구성 문서

### Phase 2: 하네스 엔지니어링 (1주)

3. **Harness Engineer** (1명)
   - Spring Boot 보일러플레이트
   - React + Vite 보일러플레이트
   - 배포 쉘 스크립트 기본 구조
   - 개발 환경 가이드
   - 로컬 개발 서버 세팅
   - 결과: 실행 가능한 프로젝트 구조

### Phase 3: 구현 (병렬, 3-4주)

#### Frontend Team

4. **StreamPlayer Agent** (1명) - **독립적, 높은 복잡도**
   - 담당: 비디오 플레이어 추상화 & 구현
   - 구현:
     - `StreamPlayer` 추상 클래스/인터페이스
     - `HLSPlayer` (Video.js)
     - `WebRTCPlayer` (WHEP 클라이언트)
     - `RTSPPlayer` (JSMpeg)
     - 플레이어 이벤트 & 콜백 정의
   - 파일 소유: `frontend/src/components/StreamPlayer/**`
   - 복잡도: **높음**

5. **UI Layout & Style Guide Agent** (1명)
   - 담당: 레이아웃 & 기업용 VMS 스타일
   - 구현:
     - 설계서 기반 메인 레이아웃
     - 카메라 그리드 컴포넌트
     - 사이드바, 헤더, 푸터
     - CSS 시스템 & 디자인 토큰
     - 색상, 폰트, 간격 정의
     - 반응형 브레이크포인트
   - 파일 소유: `frontend/src/components/{Layout,Sidebar,Header}/**`, `frontend/src/styles/**`
   - 복잡도: **중간**

6. **VMS Core Pages Agent** (1명)
   - 담당: 주요 페이지 & 기능
   - 구현:
     - **라이브 모니터링 페이지** (개인화 그리드: 공정별 탭, D&D, 동적 CCTV 선택) ⭐
     - 단일 카메라 상세 뷰
     - 타임라인 기반 재생 페이지
     - 카메라 설정 페이지
     - 이벤트/알림 관리
     - 설정 페이지
   - 파일 소유: `frontend/src/pages/**`, 관련 컴포넌트
   - 복잡도: **높음** (개인화 그리드로 인해 상향)
   - 의존성: React Dnd 라이브러리, State Management Agent의 Layout 스토어

7. **State Management & API Integration Agent** (1명)
   - 담당: 전역 상태 & REST API
   - 구현:
     - Redux/Zustand 스토어
     - API 클라이언트 (REST)
     - 커스텀 훅 (useCamera, useStream, useTimeline, useEvents)
     - 에러 처리 & 로딩 상태
     - 실시간 업데이트 (SSE/WebSocket)
   - 파일 소유: `frontend/src/{store,hooks,services}/**`
   - 복잡도: **중간**

#### Backend Team

8. **Spring Boot Core & Database Agent** (1명)
   - 담당: 엔티티 & 데이터베이스
   - 구현:
     - Spring Boot 프로젝트 세팅
     - MariaDB 커넥션 풀
     - JPA 엔티티 설계 (Camera, Stream, Recording, Event, AlertSetting)
     - Repository 계층
     - 마이그레이션 스크립트 (Flyway)
   - 파일 소유: `backend/src/main/java/com/vision/{entity,repository,config}/**`
   - 복잡도: **낮음**

9. **REST API & Controller Agent** (1명)
   - 담당: REST 엔드포인트
   - 구현:
     - Camera CRUD API
     - Stream 조회 API
     - Event/Alert 조회 API
     - 녹화 관리 API
     - 실시간 이벤트 푸시 (SSE)
     - API 문서화 (Swagger/OpenAPI)
   - 파일 소유: `backend/src/main/java/com/vision/controller/**`
   - 복잡도: **중간**

10. **Business Logic & Middleware Agent** (1명) - **높은 복잡도**
    - 담당: 서비스 로직 & L2/EAI 연동
    - 구현:
      - 서비스 계층 (CameraService, EventService, RecordingService)
      - 이벤트 처리 & 알림 시스템
      - L2/EAI 미들웨어 (Socket/TCP 통신)
      - 타임라인 데이터 조회
      - 데이터 분석 & 통계
      - 에러 처리 & 재시도 로직
    - 파일 소유: `backend/src/main/java/com/vision/{service,middleware}/**`
    - 복잡도: **높음**

---

## 7. 파일 소유권 경계

```
StreamPlayer Agent:
└── frontend/src/components/StreamPlayer/**

UI Layout Agent:
├── frontend/src/components/Layout/
├── frontend/src/components/Sidebar/
├── frontend/src/components/Header/
└── frontend/src/styles/**

VMS Core Pages Agent:
├── frontend/src/pages/**
└── frontend/src/components/{CameraDetail,Grid,Events,Settings}/**

State Management Agent:
├── frontend/src/store/**
├── frontend/src/hooks/**
└── frontend/src/services/**

Spring Boot Core Agent:
├── backend/src/main/java/com/vision/entity/**
├── backend/src/main/java/com/vision/repository/**
└── backend/src/main/java/com/vision/config/**

REST API Agent:
└── backend/src/main/java/com/vision/controller/**

Business Logic Agent:
├── backend/src/main/java/com/vision/service/**
└── backend/src/main/java/com/vision/middleware/**
```

---

## 8. 구현 순서

### Week 1-2: 리서치 & 설계
- [ ] Research Agent: 기업용 VMS 스타일 분석 (Figma 설계서 반영)
- [ ] Architecture Agent: API 스펙 & 스키마 설계 완료
- [ ] Harness Engineer: 프로젝트 보일러플레이트

### Week 3: 기초 구현
- [ ] Spring Boot Core: 엔티티 & Repository (Layouts 테이블 포함)
- [ ] State Management: 스토어 & 훅 골격
- [ ] **StreamPlayer & Grid: 추상화 클래스, HLSPlayer, 개인화 그리드 컴포넌트** ⭐
- [ ] UI Layout: 기본 레이아웃, 스타일 시스템, 공정별 탭 UI

### Week 4-5: 핵심 기능
- [ ] VMS Core Pages: 라이브 뷰, 상세 뷰
- [ ] REST API: Camera, Stream, Event 엔드포인트
- [ ] StreamPlayer: WebRTCPlayer 구현
- [ ] Business Logic: 서비스 계층 기본 구현

### Week 6: 고급 기능 & 통합
- [ ] Middleware: L2/EAI 연동 구현
- [ ] 타임라인: 재생 기능
- [ ] 실시간 업데이트: SSE/WebSocket
- [ ] 전체 E2E 테스트

---

## 9. 협업 프로토콜

### 일일 동기화 (9:00 AM)
- 각 Agent 진행 상황 공유
- 블로커 해결 (API 스펙, 타입 정의 등)
- 파일 소유권 충돌 확인

### API 스펙 공유
- 초기 REST API 스펙 확정 (Week 1 마지막)
- Mock API 제공 (병렬 구현용)
- 변경사항 24시간 전 공지

### PR 리뷰
- 매일 저녁 코드 리뷰
- Agent 간 cross-review 필수
- 테스트 커버리지 >80%

### 통합 테스트
- 월/수/금: 통합 빌드 & E2E 테스트
- 금요일: 고객 스테이징 배포

---

## 10. 요구사항 변경 관리

### 현재 요구사항 (v1.0)
- ✅ 다중 카메라 라이브 모니터링
- ✅ **개인화 그리드 대시보드** (공정별 탭, 사용자 정의 레이아웃, D&D, 동적 CCTV 선택) ⭐ **고객사 핵심 기능**
  - 이유: "나중에 비용 지불 재개발 방지" → 초기 구현에 필수 포함
- ✅ 타임라인 기반 재생
- ✅ 실시간 이벤트 알림
- ✅ 카메라 설정 관리
- ✅ WebRTC 스트림 수신 (주소 제공)

### 예상 변경사항
- UI 레이아웃 미세 조정 (고객 피드백)
- 이벤트 필터링 & 검색 기능
- 대시보드 통계 확대
- 권한 관리 (사용자/역할)
- 녹화 저장소 관리

### 변경 대응 전략
1. Architecture Agent가 영향도 분석
2. 해당 Agent에 작업 배정
3. API 스펙 변경 시 모든 Agent 공지 (24시간 전)
4. 마이그레이션 스크립트 준비 (DB 스키마 변경 시)

---

## 11. 배포 & 운영

### 배포 방식
- 쉘 스크립트 기반 배포 (`deploy.sh`)
- 기업 내부 VM (Linux/Windows)
- 무중단 배포 고려 (선택사항)

### 배포 스크립트 예시
```bash
#!/bin/bash
# 1. 백엔드 빌드 및 배포
cd backend && mvn clean package && cp target/*.jar /opt/vision/

# 2. 프론트엔드 빌드 및 배포
cd frontend && npm run build && cp -r dist/* /var/www/vision/

# 3. 데이터베이스 마이그레이션
java -jar /opt/vision/vision-monitor.jar migrate

# 4. 서비스 재시작
systemctl restart vision-monitor
```

### 모니터링
- 로그 수집 (ELK 또는 간단한 로그 파일)
- 헬스 체크 엔드포인트
- 성능 메트릭 (응답 시간, 에러율)

---

## 12. 설계서 기반 화면 구성

### 주요 화면 (핵심 요구사항)
1. **라이브 모니터링** - 개인화 가능한 다중 카메라 그리드 뷰 ⭐ **핵심 기능**
   - **공정별 탭 분류**: 냉각, 속도 등 공정별 독립 탭
   - **사용자 정의 그리드 레이아웃**: 3x2, 3x3, 2x3 등 자유 선택
   - **동적 카메라 배치**: 각 셀에 "+" 버튼으로 CCTV 목록 선택 가능
   - **드래그 & 드롭**: 플레이어 위치 자유롭게 이동 가능
   - **개인화 저장**: 사용자별 레이아웃 자동 저장 & 복원
   - 카메라별 라이브 영상 (StreamPlayer)
   - 카메라 이름, 상태 표시
   - 실시간 이벤트 인디케이터

2. **카메라 상세 뷰** - 선택된 카메라 확대
   - 영상 확대
   - 타임라인 (과거 영상)
   - 카메라 설정 정보 (우측 패널)
   - 실시간 이벤트 표시

3. **타임라인 재생** - 시간 범위 선택 & 재생
   - 날짜/시간 선택
   - 프레임 단위 이동
   - 재생 속도 조절

4. **이벤트 관리** - 감지된 이벤트 목록
   - 이벤트 필터링
   - 이벤트별 상세 정보
   - 알림 설정

5. **카메라 설정** - 각 카메라 매개변수 관리
   - 냉각 코드, 속도 등
   - 감지 임계값 설정
   - 알림 규칙

---

## 13. 성공 기준

- ✅ 모든 Agent가 파일 소유권 경계 내에서 작업
- ✅ 일일 통합 빌드 성공
- ✅ E2E 기능 테스트 통과 (주간 고객 데모)
- ✅ 코드 커버리지 >80%
- ✅ API 응답 시간 <200ms
- ✅ 스트림 재생 지연 <2초

---

## 14. 리스크 & 완화책

| 리스크 | 영향 | 완화책 |
|--------|------|--------|
| 요구사항 변경 | 높음 | Architecture Agent가 설계 시 유연성 확보 |
| 스트림 연동 | 중간 | 외부 시스템에서 WebRTC 주소 직접 제공받음 |
| 마이그레이션 복잡 | 중간 | Flyway로 버전 관리, 롤백 가능 |
| L2/EAI 미들웨어 | 중간 | 별도 Agent 담당, 초기에 스펙 명확히 |
| DB 성능 | 낮음 | MariaDB 인덱싱, 연결 풀 튜닝 |

---

## 15. 다음 단계

1. **이 문서 검토 & 피드백**
2. **설계서 기반 화면 구성 상세화**
3. **Architecture Agent: 초기 설계 (API 스펙, DB 스키마)**
4. **Harness Engineer: 보일러플레이트 생성**
5. **Agent Teams 정식 구성 & 주간 킥오프**
