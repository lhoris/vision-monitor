# Vision Monitor VMS - 구현 일정 계획
## 2026-08-11 ~ 2026-09-30 (8주)

**목표**: 9월 말까지 WebRTC 라이브 영상 스트리밍 완전 구현 및 배포 준비

---

## 📅 주간 계획 (Week-by-Week)

### **Week 1: 2026-08-11 ~ 2026-08-17**
**주제**: Frontend 최종 검증 & Backend 기초 구축

#### Frontend (완료 확인)
- ✅ 다국어 UI (한국어/영어) 실시간 변경 검증
- ✅ 모든 프로토콜 자동 감지 테스트 (HLS, WebRTC, RTSP)
- ✅ 다중 카메라 동시 재생 성능 테스트
- ✅ Settings에서 프로토콜 수동 선택 기능 검증
- ✅ BMAD Method 설치 완료

#### Backend (신규)
- 🔧 Spring Boot 3.x 프로젝트 구조 검증
- 🔧 MariaDB 연결 설정 (개발 환경)
- 🔧 Flyway 마이그레이션 환경 준비
- 🔧 JPA Entity 기본 구조 설계

**산출물**:
- ✅ Frontend 테스트 결과 보고서
- 📋 Backend 개발 환경 체크리스트

---

### **Week 2: 2026-08-18 ~ 2026-08-24**
**주제**: Database 마이그레이션 & Core Entity 개발

#### Backend - Database & Entity (신규)
- 🔧 Flyway V001__init.sql 작성
  - Camera 테이블
  - Stream 테이블
  - Recording 테이블
  - Event 테이블
  - AlertSetting 테이블
  - Layout 테이블
  - User 테이블

- 🔧 JPA Entity 클래스 구현 (7개)
  - @Entity, @Column, @Relationship 어노테이션
  - getter/setter/toString() 자동 생성
  - 유효성 검증 (@NotNull, @Size 등)

- 🔧 JPA Repository 인터페이스 (7개)
  - CrudRepository 상속
  - 커스텀 쿼리 메서드

**산출물**:
- 📋 Database 스키마 다이어그램
- 📋 Entity 클래스 명세서

---

### **Week 3: 2026-08-25 ~ 2026-08-31**
**주제**: REST API 기본 구현 (Camera, Stream)

#### Backend - REST API Phase 1 (신규)
- 🔧 CameraController 구현
  - GET /api/cameras (전체 조회)
  - GET /api/cameras/{id} (단일 조회)
  - POST /api/cameras (카메라 추가)
  - PUT /api/cameras/{id} (카메라 수정)
  - DELETE /api/cameras/{id} (카메라 삭제)

- 🔧 StreamController 구현
  - GET /api/streams (스트림 목록)
  - GET /api/streams/{id} (스트림 상세)
  - POST /api/streams (스트림 생성)
  - PUT /api/streams/{id} (스트림 수정)

- 🔧 CameraService, StreamService 비즈니스 로직
  - 카메라 등록/수정/삭제 로직
  - 스트림 연결 검증
  - 에러 처리 (400, 404, 500)

- 🔧 Request/Response DTO 생성
  - CameraDTO, StreamDTO
  - CameraCreateRequest, CameraUpdateRequest
  - ApiResponse 래퍼

**산출물**:
- 📋 API 엔드포인트 명세서 (Swagger/OpenAPI)
- 📋 Database 마이그레이션 로그

---

### **Week 4: 2026-09-01 ~ 2026-09-07**
**주제**: REST API 심화 (Event, Layout) & 통합 준비

#### Backend - REST API Phase 2 (신규)
- 🔧 EventController 구현
  - GET /api/events (이벤트 목록, 페이지네이션)
  - POST /api/events (이벤트 생성)
  - DELETE /api/events/{id}

- 🔧 LayoutController 구현
  - GET /api/layouts/{userId} (사용자 레이아웃 조회)
  - POST /api/layouts (레이아웃 저장)
  - PUT /api/layouts/{id} (레이아웃 수정)

- 🔧 RecordingController 구현
  - GET /api/recordings (녹화 목록)
  - DELETE /api/recordings/{id} (녹화 삭제)

- 🔧 Global Exception Handler
  - RuntimeException → 500 Error
  - IllegalArgumentException → 400 Bad Request
  - EntityNotFoundException → 404 Not Found

#### Frontend - Backend 연결 (수정)
- 🔧 Axios API Client 업데이트
  - 모든 엔드포인트 연결
  - 인터렉터 (토큰, 에러 처리)
  - 타임아웃 설정

- 🔧 Redux Store 연결
  - cameraSlice 비동기 액션 (fetchCameras, createCamera 등)
  - eventSlice 비동기 액션
  - layoutSlice 비동기 액션

**산출물**:
- 📋 전체 API 명세서 완성
- 📋 Frontend-Backend 통합 계획서

---

### **Week 5: 2026-09-08 ~ 2026-09-14**
**주제**: WebRTC 라이브 스트리밍 완성 & 인증 시스템

#### Backend - WebRTC & Auth (신규)
- 🔧 WebRTC 스트림 매니저
  - WHEP 엔드포인트 구현 (/api/streams/webrtc)
  - ICE 서버 설정 (STUN, TURN)
  - P2P 연결 관리
  - 재연결 로직

- 🔧 Basic Authentication 구현
  - UserController (회원가입, 로그인)
  - JWT 토큰 생성/검증
  - @PreAuthorize 권한 검증
  - 인증 인터셉터

- 🔧 스트림 프로토콜 매니저
  - HLS 매니페스트 생성
  - WebRTC SDP 처리
  - RTSP 스트림 감지

#### Frontend - 라이브 스트리밍 (수정)
- 🔧 실제 카메라 스트림 연결
  - 백엔드 WebRTC 엔드포인트 연결
  - 실시간 영상 재생 테스트
  - 연결 끊김 시 자동 재연결

- 🔧 라이브 모니터링 최적화
  - 다중 카메라 CPU 사용량 최적화
  - 버퍼링 최소화
  - 지연 시간 측정 및 표시

**산출물**:
- 📋 WebRTC 구현 완료 보고서
- 📋 인증 시스템 명세서
- 📋 성능 테스트 결과

---

### **Week 6: 2026-09-15 ~ 2026-09-21**
**주제**: 통합 테스트 & 성능 최적화

#### 통합 테스트 (신규)
- 🧪 E2E 테스트 (Selenium/Cypress)
  - 카메라 추가 → 라이브 스트림 재생
  - 프로토콜 선택 (HLS, WebRTC, RTSP) 동작
  - 다국어 UI 전체 흐름
  - 사용자 레이아웃 저장/복원

- 🧪 API 통합 테스트
  - Camera CRUD 전체 시나리오
  - Stream 연결/해제
  - Event 기록 및 조회
  - Layout 저장/로드

- 🧪 성능 테스트
  - 다중 카메라 동시 재생 (5개 이상)
  - WebRTC 지연 시간 측정
  - 메모리/CPU 모니터링
  - 네트워크 대역폭 측정

#### 최적화 (신규)
- ⚡ Backend 쿼리 최적화
  - N+1 문제 해결 (@Fetch)
  - 데이터베이스 인덱스 생성
  - 캐싱 전략 (Redis - 선택사항)

- ⚡ Frontend 최적화
  - 번들 크기 최적화
  - 이미지 지연 로딩
  - 코드 스플리팅

**산출물**:
- 📋 통합 테스트 결과 보고서
- 📋 성능 벤치마크 결과
- 📋 병목 지점 분석 및 개선안

---

### **Week 7: 2026-09-22 ~ 2026-09-28**
**주제**: 버그 수정 & 보안 강화

#### 버그 수정 (신규)
- 🐛 Week 6 테스트에서 발견된 버그 수정
  - API 응답 형식 통일
  - 예외 처리 강화
  - 엣지 케이스 처리

#### 보안 강화 (신규)
- 🔒 CORS 설정
- 🔒 CSRF 보호
- 🔒 SQL Injection 방지 (JPA 매개변수 쿼리)
- 🔒 XSS 방지 (입력값 검증)
- 🔒 Rate Limiting
- 🔒 로깅 및 모니터링

#### 문서화 (신규)
- 📚 API 문서 (Swagger UI)
- 📚 배포 가이드
- 📚 개발자 온보딩 문서
- 📚 운영 매뉴얼

**산출물**:
- 📋 버그 수정 로그
- 📋 보안 감사 결과
- 📋 완전한 API 문서

---

### **Week 8: 2026-09-29 ~ 2026-09-30**
**주제**: 최종 검증 & 배포 준비

#### 최종 검증 (신규)
- ✅ 전체 기능 회귀 테스트
- ✅ 9월 목표 달성 확인
  - ✅ WebRTC 라이브 스트리밍 작동
  - ✅ 다국어 UI 완전 구현
  - ✅ 모든 프로토콜 지원
  - ✅ 개인화 그리드 동작
  - ✅ REST API 완성

#### 배포 준비 (신규)
- 🚀 Docker 이미지 생성 (선택사항)
- 🚀 CI/CD 파이프라인 설정
- 🚀 환경 변수 관리 (.env 분리)
- 🚀 배포 자동화 스크립트
- 🚀 모니터링 설정 (로그, 메트릭)

**산출물**:
- 📋 최종 테스트 결과 보고서
- 📋 배포 체크리스트
- 📋 Go-Live 준비 완료 보고서

---

## 📊 마일스톤 & 목표

| 주차 | 마일스톤 | 상태 | 목표 |
|------|---------|------|------|
| Week 1 | Frontend 검증 완료 | ✅ Done | Backend 개발 준비 |
| Week 2 | Database & Entity 완성 | 📋 Ready | API 개발 시작 |
| Week 3 | Camera/Stream API | 🔧 In Progress | 기본 REST API |
| Week 4 | Event/Layout API | 🔧 In Progress | 전체 API 완성 |
| Week 5 | WebRTC 라이브 스트리밍 | 🔧 In Progress | **9월 목표 달성** |
| Week 6 | 통합 테스트 완료 | 📋 Ready | 품질 보증 |
| Week 7 | 버그 수정/보안 강화 | 📋 Ready | 프로덕션 준비 |
| Week 8 | 배포 준비 완료 | 📋 Ready | **Go-Live 준비** |

---

## 🎯 2026년 9월 목표 (최종)

### ✅ Frontend (완료됨)
- [x] React 19 + Vite + TypeScript
- [x] HLS/WebRTC/RTSP 플레이어
- [x] 다국어 지원 (한국어/영어)
- [x] 개인화 그리드 (탭, 드래그&드롭)
- [x] Redux 상태 관리
- [x] Tailwind 다크모드

### ✅ Backend (Week 2-5 완성 예정)
- [x] Spring Boot 3.x 기본 구조
- [x] 7개 Entity & JPA Repository
- [x] Database 마이그레이션 (Flyway)
- [x] 15+ REST API 엔드포인트
- [x] WebRTC WHEP 프로토콜 구현
- [x] 기본 인증 시스템

### ✅ 통합 & 배포 (Week 6-8 완성 예정)
- [x] E2E 테스트 (다중 시나리오)
- [x] 성능 최적화 (다중 카메라)
- [x] 보안 강화 (CORS, CSRF, XSS)
- [x] 배포 자동화
- [x] 모니터링 설정

---

## 📈 위험 요소 & 완화 방안

| 위험 | 영향 | 완화 방안 |
|------|------|---------|
| WebRTC 네트워크 지연 | High | Week 5에서 충분한 버퍼 확보, TURN 서버 준비 |
| 다중 카메라 성능 | High | Week 6에서 성능 테스트, 최적화 |
| 데이터베이스 설계 변경 | Medium | Week 2에서 설계 검증, Flyway 버전 관리 |
| 인증 토큰 관리 | Medium | JWT 표준 준수, 보안 감사 (Week 7) |

---

## 📝 회의 및 리뷰

| 날짜 | 항목 | 담당 |
|------|------|------|
| 2026-08-18 | Week 1-2 리뷰 및 백엔드 킥오프 | PM + Architect |
| 2026-08-25 | Database 설계 최종 검증 | Architect + DBA |
| 2026-09-01 | API 설계 리뷰 | API Lead + Frontend Lead |
| 2026-09-08 | WebRTC 구현 상태 확인 | Tech Lead |
| 2026-09-15 | 통합 테스트 결과 리뷰 | QA Lead + Dev Team |
| 2026-09-22 | 보안 감사 및 최적화 | Security Officer |
| 2026-09-29 | Go-Live 준비 최종 확인 | PM + 전체 팀 |

---

## 📋 성공 기준

- ✅ **9월 30일까지 WebRTC 라이브 영상 스트리밍 완전 구현**
- ✅ 모든 테스트 통과율 95% 이상
- ✅ API 응답 시간 < 200ms (평균)
- ✅ 다중 카메라 (5개) 동시 재생 안정성 > 99%
- ✅ 배포 자동화 파이프라인 구축
- ✅ 프로덕션 준비 완료

---

**문서 작성일**: 2026-08-11  
**목표 완료일**: 2026-09-30  
**버전**: 1.0 - Initial Schedule  
**담당자**: Project Manager + Technical Lead
