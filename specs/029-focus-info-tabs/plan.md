# 구현 계획: 화면 확대 보기 정보 탭

**기능 브랜치**: `029-focus-info-tabs` | **일자**: 2026-11-20 | **명세**: [spec.md](spec.md)

## 1. 구현 요약

기존 `FocusMetadataPanel`을 우측 정보 탭 컨테이너로 확장한다. 모델기본정보 화면은 기존 컴포넌트와 저장 흐름을 유지하고, 알람 이력 화면은 기존 `RecordingEventList`를 재사용한다. `CameraFocusShell`과 `CameraFocus`는 현재 모드, 이벤트 목록, 오류, 선택 이벤트를 정보 패널에 전달한다.

## 2. 기술 컨텍스트

- 프론트엔드: React, TypeScript, Vite
- 상태: 컴포넌트 로컬 상태와 기존 CameraFocus 페이지 상태 재사용
- 다국어: `frontend/src/locales/ko.json`, `frontend/src/locales/en.json`
- 테스트: Vitest, React Testing Library
- 백엔드/API/DB: 변경 없음. 기존 카메라 이벤트 조회 계약을 재사용

## 3. 구현 범위

### 포함

- 우측 정보 영역의 모델기본정보/알람 이력 탭 UI
- 실시간/녹화 모드별 기본 탭 선택
- 탭 직접 전환
- 알람 이력 목록 및 선택 이벤트 연결
- 빈 상태·오류 상태·한국어/영어 번역

### 제외

- 알람 조회 API와 DB 스키마 변경
- 알람 검색·필터·페이징
- 모델기본정보 섹션 저장 구조 변경

## 4. 상세 설계

### 컴포넌트

- `FocusMetadataPanel`: `activeTab` 상태를 관리하고 탭별 콘텐츠를 렌더링한다.
- 모델기본정보 탭: 현재 패널의 섹션 목록, 추가·편집·삭제, 선택 알람 표시를 그대로 렌더링한다.
- 알람 이력 탭: `RecordingEventList`를 사용하고 `eventsError`가 있으면 오류 상태를 표시한다.
- `CameraFocusShell`: `mode`, `events`, `eventsError`, `selectedEventId`, `onSelectEvent`를 패널에 전달한다.

### 기본 탭 상태

- `mode === 'live'`: `metadata`
- `mode === 'recording'`: `alarms`
- 모드 또는 카메라가 변경되면 해당 모드의 기본 탭으로 초기화한다.
- 탭 클릭은 현재 모드와 무관하게 허용한다.

### 이벤트 흐름

알람 이력 항목 클릭 → 기존 `onSelectEvent` 호출 → `CameraFocus`의 선택 이벤트 처리 → 선택 이벤트 상세·녹화 구간·타임라인 이동 흐름 재사용.

## 5. 검증 계획

- `FocusMetadataPanel` 테스트에서 두 탭과 모드별 기본 탭을 확인한다.
- 알람 이력 탭 클릭, 알람 항목 선택, 빈 상태와 오류 상태를 확인한다.
- 기존 `FocusVideoStage`, `RecordingTimeline`, `CameraFocus` 테스트를 실행한다.
- 프론트엔드 TypeScript 빌드와 Vite 빌드를 실행한다.
