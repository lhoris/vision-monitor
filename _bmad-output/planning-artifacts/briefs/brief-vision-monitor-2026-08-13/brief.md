---
title: "Product Brief: Vision Monitor"
status: draft
created: 2026-08-13
updated: 2026-08-13
source_baseline: "../brownfield-project-summary.md"
---

# Product Brief: Vision Monitor

## Executive Summary

Vision Monitor는 제조 공정 현장의 CCTV 영상, 카메라 상태, AI/알람 이벤트, 사용자별 관제 레이아웃을 한 화면에서 운영할 수 있게 하는 웹 기반 관제 시스템이다. 제품 경계는 외부 VMS, AI, Media Server가 제공하는 영상과 이벤트를 관제하는 Dashboard/API이다. Vision Monitor는 RTSP ingest, AI inference, media distribution, server-side overlay, encoding을 직접 책임지지 않는다.

제품의 1차 가치는 "여러 공정 카메라를 사용자가 원하는 Grid로 배치하고, 실시간 영상과 이벤트를 한 곳에서 확인하는 것"이다. 기존 Frontend PoC는 이 경험의 형태를 이미 보여준다. 다만 Backend, 인증/권한, 실제 카메라/레이아웃 저장, AI 이벤트 수집, 녹화 재생, Media Server 연동은 아직 제품 기준으로 확정/구현되어야 한다.

이 Brief는 구현을 바로 지시하기 위한 문서가 아니다. 후속 PRD와 Architecture가 흔들리지 않도록 Vision Monitor가 직접 책임지는 제품 범위와 외부 시스템 경계를 정리하기 위한 기준 문서다.

## The Problem

제조 공정 관제에서는 다수 CCTV 화면을 동시에 보면서 공정 이상, 장비 상태, 안전 이벤트를 빠르게 파악해야 한다. 현장 운영자는 고정된 VMS 화면이나 개별 카메라 화면만으로는 공정별/장비별 관심 영역을 유연하게 구성하기 어렵고, AI 감지 이벤트와 실제 영상을 같은 맥락에서 확인하기 어렵다.

현재 프로젝트 상태에서도 이 문제가 드러난다. Frontend는 개인화 Grid와 StreamPlayer PoC를 제공하지만, 실제 카메라/레이아웃/이벤트 데이터는 mock 또는 fallback이다. 즉 사용자 경험의 방향은 확인되었지만, 운영 데이터와 시스템 경계가 아직 제품 수준으로 연결되지 않았다.

## The Solution

Vision Monitor는 Browser 기반 관제 화면을 중심으로 다음 경험을 제공한다.

- 공정/장비 단위로 탭과 서브탭을 구성한다.
- 사용자가 3x2, 3x3 등 Grid에 카메라를 배치하고 변경한다.
- 각 Grid Cell에서 외부 Media Server 또는 표준 스트림 URL을 통해 실시간 영상을 본다.
- AI/VMS에서 발생한 이벤트를 수집, 저장, 필터링, 확인 처리한다.
- 필요 시 녹화 영상 검색과 재생으로 이벤트 전후 상황을 확인한다.
- 사용자/권한에 따라 카메라 관리, 설정, 레이아웃 저장 범위를 제어한다.

1차 제품 범위에서 Vision Monitor는 외부 VMS/AI/Media Server와 연동한다. 외부 시스템은 영상 stream URL, AI/알람 이벤트, 녹화 playback URL 또는 관련 metadata를 제공하고, Vision Monitor는 이를 저장, 조회, 표시, 운영 워크플로로 연결한다.

## Product Boundary

### In Scope For The Product

- Browser 기반 실시간 관제 UI
- 사용자별 또는 역할별 카메라 Grid/Layout 관리
- 카메라 metadata 관리
- 외부 Media Server가 제공하는 stream URL 재생
- AI/VMS 이벤트 ingestion API
- 이벤트 저장, 조회, 필터링, 확인 처리
- 기본 인증/권한 모델
- 녹화 metadata 조회 및 playback URL 연결
- 운영자가 사용할 설정/관리 화면

### Out Of Scope Unless Reconfirmed

- CCTV 장비 직접 discovery/ONVIF provisioning
- RTSP ingest/transcoding process 직접 운영
- AI model inference 직접 수행
- Server-side video overlay 합성
- Media Server 자체 구현
- 대규모 영상 저장소/아카이빙 시스템 직접 구현
- Email/SMS/Teams 같은 외부 알림 채널의 완전한 운영 통합

### External Boundary To Specify

제품 책임 경계는 확정되었지만, 외부 시스템과의 구체 인터페이스는 PRD/Architecture에서 확정해야 한다.

- go2rtc를 계속 사용할지, MediaMTX로 갈지, 또는 외부 VMS/Media Server가 stream URL을 제공할지
- AI 이벤트가 Spring Boot로 어떤 방식으로 들어오는지
- Overlay가 외부 시스템에서 합성된 영상으로 제공되는지, Vision Monitor Browser UI에서 metadata overlay로 표현되는지
- 녹화 영상은 누가 생성/저장하고 Vision Monitor는 어떤 URL/metadata만 관리하는지

## Who This Serves

Primary users:

- 제조 공정 운영자: 여러 카메라를 공정별로 보고 이상 상황을 빠르게 확인한다.
- 생산/설비 Supervisor: 이벤트, 알람, 카메라 상태, 녹화 근거를 확인하고 조치 상태를 관리한다.

Secondary users:

- 시스템 관리자: 카메라, 사용자, 권한, 레이아웃, 알림 설정을 관리한다.
- AI/VMS 운영 담당자: Vision Monitor로 이벤트와 stream 상태가 정상 전달되는지 확인한다.

## MVP Success Criteria

MVP는 다음 기준을 만족해야 한다.

- 운영자가 로그인 후 실제 camera metadata 기반의 Live Grid를 볼 수 있다.
- 사용자가 3x2/3x3 등 Grid Layout을 저장하고 다시 불러올 수 있다.
- 최소 하나의 실제 Media Server stream을 안정적으로 재생한다.
- AI/VMS 또는 테스트 event producer가 Spring Boot API로 이벤트를 생성할 수 있다.
- 이벤트가 DB에 저장되고 React 화면에서 필터링/확인 처리된다.
- demo hard-coded login이 제거되고 기본 인증/권한 정책이 적용된다.
- Backend API가 TODO/null/empty stub이 아닌 persistence-backed 동작을 제공한다.
- 기존 mock/fallback 흐름은 개발 모드로 격리되거나 제거된다.

## Current Product Stage

현재 단계는 "Frontend PoC + Backend Skeleton + Media Integration PoC"이다.

Confirmed:

- React 기반 관제 UI, Grid, Drag & Drop, StreamPlayer 추상화가 존재한다.
- go2rtc-style external stream page iframe 경로가 존재한다.
- Spring Boot, JPA entity, Flyway schema, repository/controller/service skeleton이 존재한다.
- Frontend tests는 현재 통과한다.

Not yet product-ready:

- 실제 backend persistence-backed API
- 실제 사용자 인증/권한
- 실제 camera/layout source of truth
- AI/VMS event ingestion
- WebRTC/HLS media server contract
- recording playback integration
- production deployment architecture

## What Makes This Different

Vision Monitor의 차별점은 새로운 영상 기술 자체보다, 제조 공정 운영자가 직접 관제 화면을 공정/장비 맥락에 맞게 구성하고 AI 이벤트와 영상 확인을 하나의 운영 흐름으로 묶는 데 있다.

정직하게 말하면, 현재 Repository에는 아직 기술적 moat가 구현되어 있지 않다. 경쟁력은 다음을 얼마나 빠르고 안정적으로 확정/통합하느냐에 달려 있다.

- 실제 현장 카메라/Media Server와의 통합
- 저지연 WebRTC와 안정적 fallback 전략
- AI 이벤트와 영상 타임라인의 정확한 연결
- 사용자가 반복적으로 쓰기 편한 Grid/Layout UX

## Major Risks

- 현재 문서 일부가 구현 완료처럼 표현하지만 실제 코드는 PoC/stub 상태다.
- Media Server 결정이 늦어지면 WebRTC, HLS, RTSP 전략이 계속 흔들린다.
- AI event contract가 없으면 알람/이벤트 PRD를 정확히 쓸 수 없다.
- Browser에서 다중 카메라를 동시에 재생할 때 성능/네트워크 제약이 클 수 있다.
- 인증/RBAC를 늦게 붙이면 API와 UI 권한 모델을 다시 설계해야 할 가능성이 있다.

## Open Questions

1. 현재 go2rtc endpoint는 운영 후보인가, 임시 PoC인가?
2. MediaMTX를 채택할 계획이 있는가?
3. AI 이벤트는 어떤 schema와 protocol로 들어오는가?
4. Overlay는 외부 시스템에서 합성된 영상으로 제공되는가, Browser UI metadata overlay로 표현해야 하는가?
5. MVP에서 녹화 영상은 필수인가, Live 관제와 이벤트 확인 이후 단계인가?
6. 사용자/권한은 local JWT/RBAC로 충분한가, 사내 SSO/LDAP 연동이 필요한가?
7. 동시에 몇 개 카메라를 재생해야 MVP 성공으로 볼 수 있는가?
8. 외부 VMS/AI/Media Server 장애 시 Dashboard는 어떤 degraded mode를 제공해야 하는가?

## Recommended Next Step

이 Product Brief의 제품 경계는 외부 VMS/AI/Media Server 연동형 관제 Dashboard로 확정한다. 다음 단계에서는 외부 시스템별 contract와 MVP 요구사항을 Brownfield PRD로 구체화한다.

그 다음 BMAD 순서는 다음이 적절하다.

```text
Product Brief review
  -> Brownfield PRD
  -> Architecture update
  -> ADR set
  -> Epic / Story breakdown
```
