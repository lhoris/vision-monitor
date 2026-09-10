# 구현 계획: 라이브 대시보드 통합 개인화

**브랜치**: `014-live-dashboard-personalization` | **일자**: 2026-09-10 | **명세**: [spec.md](./spec.md)

## 요약

라이브 대시보드 개인화는 사용자별 테마와 그리드 레이아웃을 하나의 개인화 snapshot으로 저장하고 복원한다. 저장 대상은 `TB_M26_USER_PERSONAL`이며, 레이아웃 전용 물리 테이블은 만들지 않는다. 기존 `/api/layouts/me` 계약은 유지하되 응답/요청 payload에 `version`, `theme`, `tabs`, `activeTab`을 포함한다.

## 기술 방향

- Backend: Spring Boot, JPA, MariaDB, Flyway 기반 기존 구조 유지
- Frontend: React, Redux Toolkit, Vite 기반 기존 layout/ui slice 유지
- 저장 모델: `PERSONAL_NAME='dashboard'`, `PERSONAL_DATA` JSON
- JSON 구조:

```json
{
  "version": 1,
  "theme": { "mode": "theme2" },
  "layout": {
    "activeTab": "tab-default",
    "tabs": []
  }
}
```

## 구현 범위

- `LayoutDto`가 `PERSONAL_DATA`를 직렬화/역직렬화한다.
- `LayoutService`는 현재 사용자 기준으로 `dashboard` 개인화 row를 upsert한다.
- 요청 payload의 `userId`는 신뢰하지 않고 인증 actor의 user id를 사용한다.
- `theme.mode`는 `theme1`, `theme2`, `theme3`만 허용한다.
- 프론트는 로그인 사용자별로 `/api/layouts/me`를 조회하고 저장된 테마를 즉시 적용한다.
- 테마 메뉴 변경 시 현재 레이아웃 snapshot과 함께 즉시 저장한다.
- 그리드 레이아웃 변경 시 debounce 저장을 유지하되 현재 테마도 함께 저장한다.
- backend 실패 시 기존 localStorage fallback을 유지한다.

## 제외 범위

- 카메라 마스터/영상 주소 테이블 신규 생성
- 예전 layout 물리 테이블 복구
- 공용 레이아웃, 관리자 대리 수정, 변경 이력/버전 복구 UI
- media server, RTSP ingest, AI inference

## 검증 계획

- Backend: `LayoutServiceTest`, `LayoutControllerTest`
- Frontend: layout service/slice/hook 테스트, TypeScript build
- 통합 확인: backend/frontend 재기동 후 `/api/layouts/me`, `http://localhost:3000`, `http://localhost:8080/swagger-ui.html` 응답 확인

## Constitution Check

- 한국어 산출물 유지
- 기존 backend/frontend 구조와 `/api/layouts/me` 계약을 우선 사용
- `TB_M26_USER_PERSONAL` 중심으로 구현하여 불필요한 신규 테이블을 만들지 않음
- 테스트 가능한 단위로 backend/frontend 검증 수행
- 로컬 개발 환경은 backend와 frontend를 함께 재기동하여 확인
