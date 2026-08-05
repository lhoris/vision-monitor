# Grid Personalization Component

개인화된 카메라 그리드 대시보드로, 사용자가 CCTV 배치를 자유롭게 커스터마이즈할 수 있습니다.

## 주요 기능

### 1. 공정별 탭 (Process Tabs)
- 각 공정별 탭 생성 (공정 A, 공정 B, 공정 C 등)
- 탭 추가/제거/이름 변경
- 각 탭은 독립적인 그리드 레이아웃 유지

### 2. 사용자 정의 그리드 레이아웃
- 드롭다운 선택으로 레이아웃 변경
- 지원되는 레이아웃: 2x3, 3x3, 3x2, 2x4, 4x2, 4x4
- 선택 후 즉시 리렌더링
- 저장된 레이아웃 자동 복원

### 3. 드래그 & 드롭 (D&D)
- `react-beautiful-dnd` 기반 구현
- StreamPlayer 컴포넌트를 다른 셀로 자유롭게 이동
- 시각적 피드백 (하이라이트, 스냅)
- 자동 위치 저장

### 4. 동적 카메라 추가/제거
- 각 셀의 "+" 버튼으로 카메라 추가
- 모달 형식의 CCTV 선택 UI
- 이미 사용 중인 카메라 제외 (중복 방지)
- 개별 "X" 버튼으로 카메라 제거

### 5. 개인화 저장 & 복원
- 모든 변경사항 자동 저장 (Redux + API)
- 사용자별 레이아웃 DB 저장
- 다음 접속 시 이전 레이아웃 자동 로드

## 파일 구조

```
src/components/Grid/
├── GridContainer.tsx          # 메인 컨테이너 (모든 것을 통합)
├── TabsBar.tsx                # 탭 UI 및 관리
├── DraggableCell.tsx          # 드래그 가능한 개별 셀
├── CameraSelector.tsx         # 카메라 선택 모달
├── LayoutSelector.tsx         # 레이아웃 선택 드롭다운
├── useGridLayout.ts           # 레이아웃 관리 훅
├── useGridDnd.ts              # 드래그 앤 드롭 훅
├── types.ts                   # 타입 정의
├── index.ts                   # 공개 API
├── README.md                  # 이 파일
└── __tests__/
    ├── GridContainer.test.tsx
    ├── DraggableCell.test.tsx
    ├── CameraSelector.test.tsx
    └── LayoutSelector.test.tsx
```

## 사용 방법

### 기본 사용

```tsx
import { GridContainer } from '@/components/Grid'
import type { Camera } from '@/types/camera'

const cameras: Camera[] = [
  {
    id: 1,
    name: 'Camera 1',
    location: 'Area A',
    zone: 'Zone 1',
    streamUrl: 'rtsp://example.com/stream1',
    status: 'online',
  },
  // ... 더 많은 카메라
]

export function MyLiveMonitoringPage() {
  return (
    <GridContainer userId={1} cameras={cameras} />
  )
}
```

### Redux와의 통합

GridContainer는 Redux state를 사용하여 레이아웃을 관리합니다:

```tsx
// useLayout 훅으로 레이아웃 상태 접근
import { useLayout } from '@/hooks/useLayout'

function MyComponent() {
  const {
    layout,           // 현재 레이아웃 데이터
    activeTab,        // 활성 탭
    loadLayout,       // 레이아웃 불러오기
    setActiveTab,     // 탭 변경
    addTab,           // 탭 추가
    removeTab,        // 탭 제거
    updateGridConfig, // 그리드 설정 업데이트
  } = useLayout(userId)
}
```

### 커스텀 훅

#### `useGridLayout`
레이아웃 선택 및 관리:

```tsx
import { useGridLayout } from '@/components/Grid/useGridLayout'

function MyComponent() {
  const {
    layout,
    activeTab,
    gridOptions,
    getCurrentGridLabel,
    handleChangeGridLayout,
  } = useGridLayout()
}
```

#### `useGridDnd`
드래그 & 드롭 처리:

```tsx
import { useGridDnd } from '@/components/Grid/useGridDnd'

function MyComponent() {
  const {
    handleDragEnd,
    moveCamera,
    removeCamera,
  } = useGridDnd()
}
```

## 상태 관리 (Redux)

### Layout Slice
`src/store/slices/layoutSlice.ts`에서 다음 액션을 사용합니다:

- `fetchUserLayout(userId)` - 사용자 레이아웃 조회
- `saveLayout(layout)` - 레이아웃 저장
- `updateLayout({ id, layout })` - 레이아웃 업데이트
- `setActiveTab(tabId)` - 활성 탭 변경
- `addTab(tab)` - 탭 추가
- `removeTab(tabId)` - 탭 제거
- `updateGridConfig({ tabId, config })` - 그리드 설정 업데이트
- `updateCameraPositions({ tabId, positions })` - 카메라 위치 업데이트

## API 엔드포인트

백엔드 REST API (구현 필요):

- `GET /api/layouts/{userId}` - 사용자 레이아웃 조회
- `POST /api/layouts` - 레이아웃 저장
- `PUT /api/layouts/{id}` - 레이아웃 업데이트
- `DELETE /api/layouts/{id}` - 레이아웃 삭제
- `POST /api/layouts/{layoutId}/tabs` - 탭 추가
- `PUT /api/layouts/{layoutId}/tabs/{tabId}` - 탭 업데이트
- `DELETE /api/layouts/{layoutId}/tabs/{tabId}` - 탭 삭제

## 타입 정의

### GridConfig
```typescript
interface GridConfig {
  rows: number
  cols: number
  layout: 'grid' | 'custom' | 'focus'
  gapSize: number
}
```

### Tab
```typescript
interface Tab {
  id: string
  name: string
  cameras: number[]
  gridConfig: GridConfig
  cameraPositions: CameraPosition[]
  createdAt: Date
  updatedAt: Date
}
```

### CameraPosition
```typescript
interface CameraPosition {
  cameraId: number
  row: number
  col: number
  rowSpan: number
  colSpan: number
}
```

## 성능 최적화

### 렌더링 성능
- 각 셀은 독립적으로 관리되어 불필요한 리렌더링 방지
- `useCallback`과 `useMemo`를 활용한 최적화
- React Memoization으로 컴포넌트 렌더링 최소화

### 드래그 성능
- `react-beautiful-dnd`의 효율적인 리렌더링
- 대규모 리스트에서도 부드러운 드래그 경험

### 성능 목표
- 드래그 반응속도 < 100ms
- 그리드 리렌더링 < 200ms
- 레이아웃 저장 < 500ms

## 브라우저 지원

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)
- 반응형 디자인 지원 (모바일 태블릿 미지원 - D&D 특성)

## 어두운 테마

모든 컴포넌트는 Tailwind CSS의 `dark:` 클래스를 통해 다크 테마를 지원합니다.

## 테스트

테스트 실행:
```bash
npm run test
```

테스트 UI:
```bash
npm run test:ui
```

### 테스트 커버리지
- GridContainer: 기본 렌더링, 로딩 상태
- DraggableCell: 빈 셀, 카메라가 있는 셀, 제거 버튼
- CameraSelector: 필터링, 선택, 사용 중인 카메라 제외
- LayoutSelector: 선택, 레이아웃 변경

## 알려진 제한사항

1. 모바일 디바이스에서 드래그 앤 드롭 미지원
2. 현재 카메라 이름 변경 기능 미구현
3. 탭 이름 변경은 더블클릭으로만 가능 (UI 개선 예정)

## 향후 개선 사항

- [ ] 카메라별 스트림 플레이어 통합
- [ ] 레이아웃 템플릿 저장 및 로드
- [ ] 셀 크기 조정 기능
- [ ] 셀 병합 기능
- [ ] 알림 및 이벤트 오버레이
- [ ] 성능 모니터링 대시보드
- [ ] 모바일 최적화 (터치 지원)

## 문제 해결

### 드래그 앤 드롭이 작동하지 않는 경우
1. `react-beautiful-dnd` 버전 확인
2. DragDropContext가 GridContainer를 감싸고 있는지 확인
3. 브라우저 콘솔의 에러 메시지 확인

### 레이아웃이 저장되지 않는 경우
1. Redux DevTools로 상태 확인
2. API 엔드포인트 연결 확인
3. 네트워크 요청 모니터링 (개발자 도구 - Network)

### 카메라가 표시되지 않는 경우
1. `cameras` prop이 제대로 전달되었는지 확인
2. 카메라 ID가 고유한지 확인
3. Redux 상태에 카메라 위치 정보가 있는지 확인

## 협력 팀

- **StreamPlayer Agent**: 그리드의 각 셀에 StreamPlayer 배치
- **State Management Agent**: Redux layoutSlice + useLayout 훅
- **Pages & Events Agent**: Live 페이지에 그리드 통합
- **REST API Agent (Backend)**: /api/layouts 엔드포인트

## 라이선스

MIT
