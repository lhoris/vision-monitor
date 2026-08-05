# Vision Monitor VMS - Frontend

React 19 + Vite + TypeScript로 구성된 웹 기반 VMS(영상 모니터링 시스템) 프론트엔드

## 사전 요구사항

- Node.js 18+
- npm 9+ 또는 yarn 4+

## 설치

```bash
cd frontend
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 빌드

```bash
npm run build
```

프로덕션 빌드는 `dist/` 디렉토리에 생성됩니다.

## 프로젝트 구조

```
src/
├── components/          # 리액트 컴포넌트 (Phase 3에서 구현)
│   ├── StreamPlayer/    # 비디오 스트림 플레이어
│   ├── Layout/          # 레이아웃 컴포넌트
│   ├── Grid/            # 카메라 그리드 (개인화 가능)
│   ├── CameraDetail/    # 카메라 상세 정보
│   └── Common/          # 공통 컴포넌트
├── pages/               # 페이지 컴포넌트
│   ├── Live.tsx         # 실시간 모니터링
│   ├── Playback.tsx     # 재생
│   ├── Settings.tsx     # 설정
│   └── Events.tsx       # 이벤트
├── services/            # API 서비스
│   ├── api.ts           # Axios 클라이언트
│   ├── cameraService.ts # 카메라 API
│   └── layoutService.ts # 레이아웃 API
├── store/               # Redux 스토어
│   ├── index.ts         # 스토어 설정
│   └── slices/          # Redux slices
│       ├── layoutSlice.ts      # 개인화 레이아웃
│       ├── cameraSlice.ts      # 카메라 상태
│       ├── eventSlice.ts       # 이벤트 상태
│       └── uiSlice.ts          # UI 상태
├── hooks/               # 커스텀 훅
│   ├── useLayout.ts     # 레이아웃 관리 훅
│   └── useCamera.ts     # 카메라 관리 훅
├── types/               # TypeScript 타입 정의
│   ├── index.ts         # 전체 타입
│   ├── camera.ts        # 카메라 타입
│   ├── layout.ts        # 레이아웃 타입
│   └── api.ts           # API 응답 타입
└── styles/              # CSS/스타일
    ├── global.css       # 전역 스타일
    ├── variables.css    # CSS 변수
    └── tailwind.css     # Tailwind 설정
```

## 주요 기술 스택

- **React 19**: UI 라이브러리
- **Vite**: 빌드 도구 (고속 개발)
- **TypeScript**: 타입 안전성
- **Redux Toolkit**: 상태 관리
- **Axios**: HTTP 클라이언트
- **Tailwind CSS**: 유틸리티 CSS
- **Vitest**: 단위 테스트

## 개발 가이드

### 새로운 페이지 추가

```typescript
// src/pages/NewPage.tsx
export function NewPage() {
  return <div>{/* 내용 */}</div>
}
```

### 새로운 컴포넌트 추가

```typescript
// src/components/MyComponent/index.tsx
import { useAppDispatch, useAppSelector } from '@/store'

export function MyComponent() {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.xxx)

  return <div>{/* 내용 */}</div>
}
```

### Redux State 추가

1. `src/store/slices/`에 새로운 slice 생성
2. `src/store/index.ts`에서 reducer 등록
3. `useAppDispatch`와 `useAppSelector` 사용

### API 호출

```typescript
import { apiClient } from '@/services/api'

const response = await apiClient.get<CameraType>('/cameras/1')
if (response.data) {
  // 성공
}
```

## 테스트

```bash
npm run test          # 테스트 실행
npm run test:ui       # UI 테스트 실행
```

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm run preview
```

## 환경 변수

`.env.example`를 참고하여 `.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

## 트러블슈팅

### 포트 3000이 이미 사용 중인 경우

```bash
npm run dev -- --port 3001
```

### API 연결 오류

`vite.config.ts`의 API proxy 설정 확인:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

## Phase 3 구현 예정

- [ ] 카메라 라이브 스트림 재생
- [ ] 개인화된 그리드 레이아웃
- [ ] 이벤트 실시간 모니터링
- [ ] 녹화 재생
- [ ] 사용자 설정 관리
- [ ] 알림 시스템

## 자세한 내용

- [Redux 가이드](../docs/redux-guide.md)
- [API 명세](../docs/api-spec.md)
- [스타일 가이드](../docs/style-guide.md)
