# Vision Monitor VMS - 상세 구현 일정 (수정)
## 2026-08-11 ~ 2026-09-30 (8주)

**최종 목표**: 9월 30일 WebRTC 라이브 영상 스트리밍 + 완전한 사용자 관리 시스템 완성

---

## 📅 주간 상세 계획

### **Week 1: 2026-08-11 ~ 2026-08-17**
**주제**: Frontend 최종 검증 + Backend 기초 설계

#### Frontend (완료 항목 검증)
- ✅ 영상 재생 플레이어 (HLS/WebRTC/RTSP) 검증
- ✅ 개인화 그리드 (공정탭, 세부공정탭) 동작 확인
- ✅ 다국어 UI (한국어/영어) 실시간 전환 테스트
- ✅ 다중 카메라 동시 재생 안정성 확인
- ✅ Settings에서 카메라 추가/수정/삭제 기능 테스트

#### Backend - Database 설계
- 🔧 데이터베이스 스키마 설계
  ```
  Users 테이블
  - user_id (PK)
  - username (unique)
  - password (bcrypt)
  - email
  - role (admin, user, operator)
  - created_at, updated_at
  
  Cameras 테이블
  - camera_id (PK)
  - user_id (FK)
  - name
  - location
  - zone
  - stream_url
  - stream_protocol (HLS, WebRTC, RTSP)
  - status (online, offline, error)
  - created_at, updated_at
  
  Streams 테이블
  - stream_id (PK)
  - camera_id (FK)
  - type (HLS, WebRTC, RTSP)
  - url
  - status
  
  Layouts 테이블
  - layout_id (PK)
  - user_id (FK)
  - tabs (JSON) - 공정별 탭
  - camera_positions (JSON) - 그리드 배치
  - created_at, updated_at
  
  Events 테이블
  - event_id (PK)
  - camera_id (FK)
  - event_type
  - description
  - timestamp
  
  Recordings 테이블
  - recording_id (PK)
  - camera_id (FK)
  - start_time
  - end_time
  - file_path
  - status
  ```

- 🔧 Flyway 마이그레이션 계획
  - V001__init.sql (테이블 생성)
  - V002__add_indexes.sql (인덱스)

#### 산출물
- ✅ Frontend 최종 검증 보고서
- 📋 Database ERD (Entity Relationship Diagram)
- 📋 Flyway 마이그레이션 계획서

---

### **Week 2: 2026-08-18 ~ 2026-08-24**
**주제**: 인증 시스템 & 사용자 관리 (Backend Phase 1)

#### Backend - Authentication & User Management
- 🔧 User Entity & Repository
  ```java
  @Entity
  public class User {
    @Id
    private Long userId;
    private String username;
    private String password; // bcrypt 암호화
    private String email;
    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN, USER, OPERATOR
    private LocalDateTime createdAt;
  }
  ```

- 🔧 AuthenticationController & Service
  - POST /api/auth/register (회원가입)
    - 요청: username, password, email
    - 검증: 중복 체크, 비밀번호 강도 검증
    - 응답: 사용자 ID, JWT 토큰
  
  - POST /api/auth/login (로그인)
    - 요청: username, password
    - 검증: 자격증명 확인
    - 응답: JWT 토큰, 사용자 정보
  
  - POST /api/auth/refresh (토큰 갱신)
    - Refresh Token으로 새 Access Token 발급
  
  - POST /api/auth/logout (로그아웃)
    - 토큰 블랙리스트에 추가

- 🔧 JWT Token 관리
  - AccessToken (15분 만료)
  - RefreshToken (7일 만료)
  - TokenProvider (생성/검증/파싱)
  - TokenBlacklist (로그아웃 처리)

- 🔧 Security Configuration
  ```java
  @Configuration
  @EnableWebSecurity
  public class SecurityConfig {
    - JWT 인증 필터
    - CORS 설정
    - 경로별 권한 설정
      /api/auth/** - 허용
      /api/users/** - ADMIN만
      /api/cameras/** - 인증된 사용자
      /api/layouts/** - 인증된 사용자
  }
  ```

- 🔧 UserController & UserService
  - GET /api/users/me (현재 사용자 정보)
  - PUT /api/users/me (프로필 수정)
  - GET /api/users (사용자 목록 - ADMIN only)
  - PUT /api/users/{id}/role (권한 변경 - ADMIN only)
  - DELETE /api/users/{id} (사용자 삭제 - ADMIN only)

#### Frontend - 로그인 UI (준비)
- 🔧 로그인 페이지 컴포넌트 구조 설계
  - 폼 레이아웃
  - 입력 검증
  - 에러 메시지 표시
  - 회원가입 링크

#### 산출물
- 📋 JWT 토큰 명세서
- 📋 Authentication API 문서
- 📋 보안 정책 문서

---

### **Week 3: 2026-08-25 ~ 2026-08-31**
**주제**: 카메라 & 스트림 API (Backend Phase 2)

#### Backend - Camera & Stream Management
- 🔧 Camera Entity & Repository (완전 구현)
  ```java
  @Entity
  public class Camera {
    @Id
    private Long cameraId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // 카메라 소유자
    
    private String name;
    private String location;
    private String zone;
    private String streamUrl;
    private String streamProtocol; // HLS, WebRTC, RTSP
    private String status; // online, offline, error
    private LocalDateTime lastSeen;
    private String resolution;
    private Integer fps;
  }
  ```

- 🔧 CameraController - 완전 CRUD
  - GET /api/cameras (현재 사용자의 카메라 목록)
  - GET /api/cameras/{id} (카메라 상세)
  - POST /api/cameras (카메라 추가)
    - streamProtocol 자동 감지 또는 수동 지정
  - PUT /api/cameras/{id} (카메라 수정)
  - DELETE /api/cameras/{id} (카메라 삭제)
  - GET /api/cameras/{id}/status (카메라 상태 확인)

- 🔧 Stream Entity & Repository
  ```java
  @Entity
  public class Stream {
    @Id
    private Long streamId;
    
    @ManyToOne
    private Camera camera;
    
    private String type; // HLS, WebRTC, RTSP
    private String url;
    private String status; // active, inactive, error
    private Integer bandwidth;
  }
  ```

- 🔧 StreamController
  - GET /api/streams (스트림 목록)
  - GET /api/streams/{id} (스트림 상세)
  - POST /api/cameras/{id}/streams (스트림 생성)
  - PUT /api/streams/{id} (스트림 수정)
  - DELETE /api/streams/{id} (스트림 삭제)

- 🔧 CameraService - 비즈니스 로직
  - 카메라 추가 시 프로토콜 자동 감지
  - 카메라 상태 모니터링
  - 스트림 연결 검증
  - 중복 등록 방지

#### Frontend - 카메라 관리 통합 (기존 Settings 연동)
- 🔧 Settings 페이지와 Backend API 연동
  - 카메라 조회 API 호출
  - 카메라 추가/수정/삭제 API 연동
  - 로딩 상태 및 에러 처리

#### 산출물
- 📋 Camera & Stream API 명세서
- 📋 API 응답 예제
- 📋 에러 코드 정의서

---

### **Week 4: 2026-09-01 ~ 2026-09-07**
**주제**: 레이아웃 & 이벤트 API + 권한 관리 (Backend Phase 3)

#### Backend - Layout & Event Management
- 🔧 Layout Entity & Repository
  ```java
  @Entity
  public class Layout {
    @Id
    private Long layoutId;
    
    @ManyToOne
    private User user;
    
    @Column(columnDefinition = "JSON")
    private String tabs; // 공정탭 JSON
    
    @Column(columnDefinition = "JSON")
    private String cameraPositions; // 카메라 배치 JSON
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
  }
  ```

- 🔧 LayoutController
  - GET /api/users/me/layout (현재 사용자 레이아웃)
  - POST /api/layouts (레이아웃 저장)
  - PUT /api/layouts/{id} (레이아웃 수정)
  - DELETE /api/layouts/{id} (레이아웃 삭제)
  - GET /api/layouts/history (레이아웃 버전 이력)

- 🔧 Event Entity & Repository
  ```java
  @Entity
  public class Event {
    @Id
    private Long eventId;
    
    @ManyToOne
    private Camera camera;
    
    private String eventType;
    private String description;
    private LocalDateTime timestamp;
    private String severity; // INFO, WARNING, ERROR
  }
  ```

- 🔧 EventController
  - GET /api/events (이벤트 목록, 페이지네이션)
  - GET /api/events?camera_id={id} (특정 카메라 이벤트)
  - GET /api/events?from={date}&to={date} (날짜 범위)
  - POST /api/events (이벤트 기록)
  - DELETE /api/events/{id} (이벤트 삭제)

- 🔧 Recording Entity & Controller
  - GET /api/recordings (녹화 목록)
  - POST /api/cameras/{id}/recordings/start (녹화 시작)
  - POST /api/cameras/{id}/recordings/stop (녹화 종료)
  - DELETE /api/recordings/{id} (녹화 삭제)

#### Backend - 권한 관리 (RBAC)
- 🔧 @PreAuthorize 어노테이션 적용
  ```java
  @PreAuthorize("hasRole('ADMIN')")
  public List<User> getAllUsers() { }
  
  @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
  public Camera addCamera() { }
  
  @PreAuthorize("@cameraService.isOwner(#cameraId, principal.username)")
  public Camera getCamera(@PathVariable Long cameraId) { }
  ```

- 🔧 Role 기반 접근 제어
  - ADMIN: 모든 사용자/카메라/설정 관리
  - OPERATOR: 카메라 관리 + 녹화/이벤트 조회
  - USER: 자신의 카메라만 관리

#### Frontend - 레이아웃 저장/로드 기능
- 🔧 개인화 그리드를 Backend API와 연동
  - 탭 구성 저장
  - 카메라 배치 저장
  - 저장된 레이아웃 불러오기

#### 산출물
- 📋 Layout & Event API 명세서
- 📋 권한 관리 정책서
- 📋 Recording API 명세서

---

### **Week 5: 2026-09-08 ~ 2026-09-14**
**주제**: WebRTC 라이브 스트리밍 구현 (핵심 목표) 🎯

#### Backend - WebRTC WHEP Server 구현
- 🔧 WHEP (WebRTC-HTTP Egress Protocol) Endpoint
  ```
  POST /api/streams/webrtc/{streamId}/offer
  요청: SDP Offer
  응답: SDP Answer + Session 정보
  
  DELETE /api/streams/webrtc/{sessionId}
  연결 종료
  ```

- 🔧 WebRTC Stream Manager
  - RTCPeerConnection 생성 및 관리
  - SDP 생성/파싱
  - ICE 후보자 수집
  - STUN/TURN 서버 설정

- 🔧 실시간 영상 수신 및 전달
  - RTSP -> WebRTC 변환
  - HLS -> WebRTC 변환 (선택사항)
  - 비트레이트 적응형 스트리밍
  - 버퍼링 및 재전송

- 🔧 WebRTC Stream Controller
  - POST /api/cameras/{id}/rtc/offer (WebRTC 세션 시작)
  - POST /api/cameras/{id}/rtc/answer (Answer 전송)
  - GET /api/cameras/{id}/rtc/stats (스트림 통계)
  - DELETE /api/cameras/{id}/rtc (연결 종료)

#### Frontend - WebRTC 라이브 스트리밍 연동
- 🔧 StreamPlayer 컴포넌트와 Backend 연동
  ```typescript
  // WebRTC 자동 감지
  if (camera.streamProtocol === 'webrtc') {
    const offer = await peerConnection.createOffer();
    const answer = await fetch(`/api/cameras/${id}/rtc/offer`, {
      method: 'POST',
      body: JSON.stringify({ offer })
    });
    await peerConnection.setRemoteDescription(answer);
  }
  ```

- 🔧 실시간 영상 재생
  - 카메라 선택 → WebRTC 연결 자동 시작
  - 연결 상태 표시 (연결중, 연결됨, 오류)
  - 지연 시간 표시
  - 재연결 자동화

- 🔧 Live 페이지에 실제 카메라 스트림 표시
  - 테스트 스트림 → 실제 카메라 스트림으로 변경
  - 다중 카메라 동시 재생
  - 성능 모니터링

#### 산출물
- 📋 WHEP 구현 문서
- 📋 WebRTC 스트리밍 흐름도
- 📋 성능 벤치마크 결과

---

### **Week 6: 2026-09-15 ~ 2026-09-21**
**주제**: Frontend-Backend 통합 + 로그인 UI 구현

#### Frontend - 로그인 & 인증 UI
- 🔧 로그인 페이지 구현
  - 사용자명/비밀번호 입력 폼
  - 회원가입 버튼
  - "아이디 저장" 기능 (localStorage)
  - 로그인 오류 메시지 표시

- 🔧 회원가입 페이지 구현
  - 사용자명, 이메일, 비밀번호 입력
  - 비밀번호 강도 표시기
  - 이용약관 동의
  - 유효성 검증 (실시간)

- 🔧 JWT 토큰 관리 (Frontend)
  - AccessToken을 localStorage에 저장
  - API 요청 시 Authorization 헤더 추가
  - 토큰 만료 시 RefreshToken으로 갱신
  - 로그아웃 시 토큰 삭제

- 🔧 PrivateRoute 구현
  - 인증 없이 접근 차단
  - 로그인 페이지로 리다이렉트
  - 권한 기반 접근 제어 (역할별)

- 🔧 사용자 프로필 메뉴
  - Header에 사용자명 표시
  - 프로필 수정 페이지
  - 로그아웃 버튼

#### Frontend - 전체 페이지 연동
- 🔧 Live 페이지
  - Backend API에서 카메라 목록 조회
  - 저장된 레이아웃 로드
  - WebRTC 라이브 스트리밍 재생

- 🔧 Settings 페이지
  - Backend API와 완전 연동
  - 카메라 추가/수정/삭제
  - 프로토콜 선택 및 자동 감지

- 🔧 Playback 페이지
  - 녹화 목록 조회 (Backend API)
  - 타임라인 및 재생 기능

- 🔧 Events 페이지
  - 이벤트 목록 조회 (날짜, 카메라별 필터)
  - 이벤트 상세 정보 표시

#### 통합 테스트 (시작)
- 🧪 로그인 → Live 페이지 흐름
- 🧪 카메라 추가 → 라이브 스트리밍
- 🧪 레이아웃 저장 → 복원

#### 산출물
- ✅ 로그인/회원가입 기능 완성
- ✅ Frontend-Backend API 연동 완료
- 📋 통합 테스트 결과

---

### **Week 7: 2026-09-22 ~ 2026-09-28**
**주제**: 성능 최적화 + 보안 강화 + 버그 수정

#### 성능 최적화
- ⚡ Backend 쿼리 최적화
  - N+1 문제 해결 (@EntityGraph, Fetch Join)
  - 데이터베이스 인덱스 생성
    - Users(username)
    - Cameras(user_id, status)
    - Layouts(user_id)
    - Events(camera_id, timestamp)

- ⚡ Frontend 번들 최적화
  - 코드 스플리팅 (라우트별)
  - 불필요한 의존성 제거
  - Tree-shaking 활성화

- ⚡ WebRTC 성능 최적화
  - 비트레이트 자동 조절
  - 해상도 적응형 스트리밍
  - 버퍼링 시간 최소화

- ⚡ 다중 카메라 동시 재생
  - CPU 사용률 모니터링
  - 메모리 누수 확인
  - 최대 동시 재생 카메라 수 결정

#### 보안 강화
- 🔒 CORS 설정
  ```java
  @Configuration
  public class CorsConfig {
    allowedOrigins: ["http://localhost:3000", "https://yourdomain.com"]
    allowedMethods: ["GET", "POST", "PUT", "DELETE"]
    allowedHeaders: ["Authorization", "Content-Type"]
  }
  ```

- 🔒 CSRF 보호
  - CSRF 토큰 발급 및 검증

- 🔒 SQL Injection 방지
  - JPA 매개변수 쿼리만 사용
  - Prepared Statement 확인

- 🔒 XSS 방지
  - 입력값 sanitization
  - Content Security Policy (CSP) 헤더 설정

- 🔒 Rate Limiting
  - 로그인: 5회/5분
  - API: 100회/분 (사용자당)

- 🔒 비밀번호 정책
  - 최소 8자, 대문자/숫자/특수문자 포함
  - bcrypt로 암호화
  - 비밀번호 변경 이력 보관

- 🔒 API 응답 보안
  - 민감 정보 제외 (비밀번호, 토큰)
  - 에러 메시지 최소화

#### 버그 수정
- 🐛 Week 6 테스트 결과 버그 수정
- 🐛 토큰 만료 처리
- 🐛 동시성 문제 (카메라 추가 시 중복)
- 🐛 WebRTC 연결 끊김 처리

#### 산출물
- 📋 성능 벤치마크 결과
- 📋 보안 감사 체크리스트
- 📋 버그 수정 로그

---

### **Week 8: 2026-09-29 ~ 2026-09-30**
**주제**: 최종 검증 + 배포 준비 + Go-Live 준비

#### 최종 통합 테스트
- ✅ 전체 기능 회귀 테스트
  - 로그인 → 카메라 관리 → 라이브 스트리밍
  - 다국어 UI 전체 흐름
  - 권한별 접근 제어 (Admin, User, Operator)
  - 에러 상황 처리

- ✅ 9월 목표 달성 확인
  - ✅ WebRTC 라이브 영상 스트리밍 작동
  - ✅ 로그인/인증 시스템 완성
  - ✅ 사용자 관리 시스템 완성
  - ✅ 카메라 관리 API 완성
  - ✅ 레이아웃 저장/복원 기능
  - ✅ 다국어 UI (한국어/영어)

- ✅ 성능 테스트
  - 5개 카메라 동시 재생 안정성
  - API 응답 시간 < 200ms
  - 메모리 누수 없음

#### 배포 준비
- 🚀 프로덕션 환경 설정
  - application-prod.yml 작성
  - 데이터베이스 연결 설정
  - JWT 시크릿 키 생성
  - CORS 도메인 설정

- 🚀 Docker 이미지 생성 (선택사항)
  ```dockerfile
  FROM openjdk:21-jdk
  COPY backend/build/libs/vision-monitor-api.jar app.jar
  ENTRYPOINT ["java", "-jar", "/app.jar"]
  ```

- 🚀 CI/CD 파이프라인 (GitHub Actions)
  - 푸시 시 자동 빌드
  - 테스트 자동 실행
  - 성공 시 Docker Hub 업로드

- 🚀 배포 자동화 스크립트
  - 데이터베이스 마이그레이션 자동 실행
  - 애플리케이션 시작

- 🚀 모니터링 & 로깅
  - ELK Stack (Elasticsearch, Logstash, Kibana) 설정 (선택사항)
  - 로그 수집 및 분석
  - 에러 알림 설정

#### 운영 문서 작성
- 📚 배포 가이드
- 📚 운영 매뉴얼
- 📚 트러블슈팅 가이드
- 📚 API 문서 (Swagger UI)

#### 최종 검증 체크리스트
- ✅ 모든 기능 동작 확인
- ✅ 모든 테스트 통과 (95% 이상)
- ✅ 성능 기준 충족
- ✅ 보안 감사 완료
- ✅ 문서화 완료
- ✅ 배포 준비 완료

#### 산출물
- ✅ 최종 테스트 결과 보고서
- ✅ Go-Live 준비 완료 보고서
- ✅ 프로덕션 배포 가이드

---

## 📊 마일스톤 요약

| 주차 | 주제 | 핵심 산출물 | 상태 |
|------|------|-----------|------|
| W1 | Frontend 검증 + DB 설계 | ERD, 마이그레이션 계획 | ✅ Ready |
| W2 | 인증 시스템 | JWT, Auth API | 🔧 Core |
| W3 | Camera/Stream API | Camera/Stream Controller | 🔧 Core |
| W4 | Layout/Event API + 권한 관리 | RBAC, Layout API | 🔧 Core |
| W5 | **WebRTC 라이브 스트리밍** | WHEP Server, 실시간 영상 | 🎯 **Goal** |
| W6 | Frontend 통합 + 로그인 UI | 로그인/회원가입, 전체 연동 | 🔧 Integration |
| W7 | 성능 + 보안 | 최적화, 감사 완료 | 📋 Polish |
| W8 | 최종 검증 + 배포 | Go-Live 준비 완료 | ✅ Ready |

---

## 🎯 9월 30일 최종 목표

### Backend (완성)
- ✅ 7개 Entity & Repository (User, Camera, Stream, Layout, Event, Recording, AlertSetting)
- ✅ 20+ REST API 엔드포인트
- ✅ JWT 기반 인증/인가
- ✅ 사용자 관리 시스템
- ✅ 권한 기반 접근 제어 (RBAC)
- ✅ WebRTC WHEP 라이브 스트리밍
- ✅ 에러 처리 및 로깅
- ✅ 데이터베이스 마이그레이션

### Frontend (완성)
- ✅ 로그인/회원가입 페이지
- ✅ 사용자 프로필 관리
- ✅ 카메라 관리 페이지
- ✅ WebRTC 라이브 스트리밍
- ✅ 개인화 그리드 (공정탭, 세부공정탭, 드래그&드롭)
- ✅ 다국어 UI (한국어/영어)
- ✅ JWT 토큰 관리
- ✅ 권한별 UI 표시

### 품질 보증
- ✅ 통합 테스트 (95% 이상 통과)
- ✅ 성능 테스트 (다중 카메라 안정성)
- ✅ 보안 감사 완료
- ✅ 배포 자동화 완료

---

## ⚠️ 위험 요소 & 완화 방안

| 위험 | 영향 | 완화 방안 |
|------|------|---------|
| JWT 토큰 관리 복잡성 | High | W2에서 충분한 테스트, 토큰 갱신 로직 검증 |
| WebRTC 네트워크 지연 | High | W5에서 STUN/TURN 서버 최적화 |
| 다중 카메라 성능 | High | W7에서 성능 테스트, 비트레이트 조절 |
| 권한 관리 오류 | Medium | W4에서 RBAC 철저히 테스트 |
| 토큰 만료 처리 | Medium | W6에서 자동 갱신 로직 검증 |

---

## 📅 주요 리뷰 회의

| 날짜 | 항목 | 참석자 |
|------|------|--------|
| 2026-08-18 | W1 완료 + W2 킥오프 | PM, Architect, Backend Lead |
| 2026-08-25 | DB 스키마 최종 검증 | Architect, DBA |
| 2026-09-01 | API 설계 리뷰 | API Lead, Backend Team |
| 2026-09-08 | WebRTC 구현 상태 | Tech Lead, Frontend Lead |
| 2026-09-15 | 통합 테스트 리포트 | QA Lead, Dev Team |
| 2026-09-22 | 보안/성능 감사 결과 | Security Officer, Architect |
| 2026-09-29 | **Go-Live 준비 최종 확인** | **전체 팀** |

---

## 📝 성공 기준

### 기능
- ✅ WebRTC 라이브 영상 스트리밍 (지연 < 1초)
- ✅ 로그인/인증 시스템 작동
- ✅ 사용자 관리 시스템 작동
- ✅ 카메라 추가/수정/삭제 기능
- ✅ 개인화 레이아웃 저장/복원
- ✅ 다국어 UI 완벽 작동

### 성능
- ✅ 다중 카메라 (5개) 동시 재생 안정성 > 99%
- ✅ API 평균 응답 시간 < 200ms
- ✅ 메모리 누수 없음
- ✅ CPU 사용률 < 70% (5개 카메라 재생 시)

### 품질
- ✅ 테스트 통과율 95% 이상
- ✅ 보안 감사 완료
- ✅ 문서화 100% 완료
- ✅ 배포 자동화 구축

---

**문서 작성일**: 2026-08-11 (수정)  
**최종 목표**: 2026-09-30 WebRTC 라이브 스트리밍 + 완전한 사용자 관리 시스템 완성  
**버전**: 2.0 - Detailed Breakdown  
**담당자**: Project Manager + Technical Lead
