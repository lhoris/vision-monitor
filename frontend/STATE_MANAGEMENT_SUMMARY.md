# State Management & API Integration 구현 완료

## 개요
Vision Monitor 프론트엔드의 Redux 기반 state management와 API 통신 계층이 완성되었습니다.

---

## 1. Redux Store (src/store/)

### 구조
```
store/
├── index.ts           # Store 설정 및 타입 정의
└── slices/
    ├── index.ts       # Slices 내보내기
    ├── cameraSlice.ts     # 카메라 상태
    ├── eventSlice.ts      # 이벤트/알림 상태
    ├── layoutSlice.ts     # 레이아웃 상태 ⭐ (Grid Agent와 협업)
    └── uiSlice.ts         # UI 상태
```

### 각 Slice 상세

#### 1.1 cameraSlice.ts
**상태:**
- `cameras`: 카메라 목록
- `selectedCamera`: 선택된 카메라 상세정보
- `selectedCameraId`: 선택된 카메라 ID
- `loading`: 로딩 상태
- `error`: 에러 메시지

**Async Thunks:**
- `fetchAllCameras()` - 모든 카메라 조회
- `fetchCameraDetail(cameraId)` - 카메라 상세정보 조회
- `createCameraAsync(camera)` - 카메라 생성
- `updateCameraAsync(id, camera)` - 카메라 수정
- `deleteCameraAsync(cameraId)` - 카메라 삭제

**Reducers:**
- `selectCamera(id)` - 카메라 선택
- `clearSelectedCamera()` - 선택 해제
- `clearError()` - 에러 초기화

**사용 예시:**
```typescript
const { dispatch } = useAppDispatch()
dispatch(fetchAllCameras())
dispatch(selectCamera(1))
```

#### 1.2 eventSlice.ts
**상태:**
- `events`: 이벤트 목록
- `selectedEvent`: 선택된 이벤트
- `alertSettings`: 알림 설정
- `pagination`: 페이지네이션 정보
- `filter`: 필터 설정
- `loading`: 로딩 상태
- `error`: 에러 메시지

**Async Thunks:**
- `fetchEvents(params)` - 이벤트 목록 조회
- `fetchCameraEvents(cameraId, params)` - 카메라별 이벤트 조회
- `acknowledgeEventAsync(eventId)` - 이벤트 확인
- `acknowledgeEventsAsync(eventIds)` - 복수 이벤트 확인
- `deleteEventAsync(eventId)` - 이벤트 삭제
- `fetchAlertSettings(cameraId)` - 알림 설정 조회
- `createAlertSettingAsync(setting)` - 알림 설정 생성
- `updateAlertSettingAsync(id, setting)` - 알림 설정 수정
- `deleteAlertSettingAsync(id)` - 알림 설정 삭제

**Reducers:**
- `setEventFilter(filter)` - 필터 설정
- `addEvent(event)` - 이벤트 추가 (WebSocket 등)
- `updateEvent(event)` - 이벤트 수정
- `acknowledgeEvent(eventId)` - 이벤트 확인 (로컬)
- `clearError()` - 에러 초기화

#### 1.3 layoutSlice.ts ⭐ (Grid Agent와 협업)
**상태:**
- `layout`: 사용자 레이아웃
- `activeTab`: 활성 탭 ID
- `loading`: 로딩 상태
- `error`: 에러 메시지

**Async Thunks:**
- `fetchUserLayout(userId)` - 사용자 레이아웃 조회
- `saveLayout(layout)` - 레이아웃 저장
- `updateLayout(id, layout)` - 레이아웃 수정

**Reducers:**
- `setActiveTab(tabId)` - 활성 탭 변경
- `addTab(tab)` - 탭 추가
- `removeTab(tabId)` - 탭 제거
- `updateGridConfig(tabId, config)` - 그리드 설정 수정
- `updateCameraPositions(tabId, positions)` - 카메라 위치 수정
- `clearError()` - 에러 초기화

#### 1.4 uiSlice.ts
**상태:**
- `sidebarOpen`: 사이드바 표시 여부
- `themeMode`: 테마 모드 ('light' | 'dark')
- `notifications`: 알림 목록
- `modal`: 모달 상태
- `selectedTab`: 선택된 탭

**Reducers:**
- `toggleSidebar()` - 사이드바 토글
- `setSidebarOpen(bool)` - 사이드바 상태 설정
- `setThemeMode(mode)` - 테마 변경
- `toggleTheme()` - 테마 토글
- `addNotification(notification)` - 알림 추가
- `removeNotification(id)` - 알림 제거
- `clearNotifications()` - 모든 알림 제거
- `openModal(type, data)` - 모달 열기
- `closeModal()` - 모달 닫기
- `setSelectedTab(tabId)` - 선택된 탭 변경

---

## 2. API Client (src/services/)

### 구조
```
services/
├── index.ts           # Services 내보내기
├── api.ts            # Axios 클라이언트
├── cameraService.ts   # 카메라 API
├── eventService.ts    # 이벤트 API
└── layoutService.ts   # 레이아웃 API
```

### 2.1 api.ts (Axios 인스턴스)

**기능:**
- Bearer 토큰 자동 인증
- 401 Unauthorized 처리 (자동 로그인 리다이렉트)
- API 에러 정규화
- Request/Response 인터셉터

**메서드:**
```typescript
apiClient.get<T>(url, params?)
apiClient.post<T>(url, data?)
apiClient.put<T>(url, data?)
apiClient.delete<T>(url)
```

**에러 처리:**
```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

### 2.2 cameraService.ts

**메서드:**
```typescript
getAllCameras(): Promise<Camera[]>
getCameraDetail(cameraId): Promise<CameraDetail>
getCameraStatus(cameraId): Promise<string>
createCamera(camera): Promise<Camera>
updateCamera(id, camera): Promise<Camera>
deleteCamera(id): Promise<boolean>
getCamerasByZone(zone): Promise<Camera[]>
checkCameraHealth(cameraId): Promise<{online: boolean, latency?: number}>
```

### 2.3 eventService.ts

**메서드:**
```typescript
getEvents(params?): Promise<PaginatedResponse<Event>>
getEventDetail(eventId): Promise<Event>
getCameraEvents(cameraId, params?): Promise<PaginatedResponse<Event>>
acknowledgeEvent(eventId): Promise<Event>
acknowledgeEvents(eventIds): Promise<boolean>
deleteEvent(eventId): Promise<boolean>
deleteEvents(eventIds): Promise<boolean>
getAlertSettings(cameraId?): Promise<AlertSetting[]>
createAlertSetting(setting): Promise<AlertSetting>
updateAlertSetting(id, setting): Promise<AlertSetting>
deleteAlertSetting(id): Promise<boolean>
```

### 2.4 layoutService.ts

**메서드:**
```typescript
getUserLayout(userId): Promise<Layout>
saveLayout(layout): Promise<Layout>
updateLayout(id, layout): Promise<Layout>
deleteLayout(id): Promise<boolean>
addTab(layoutId, tab): Promise<Tab>
updateTab(layoutId, tabId, tab): Promise<Tab>
deleteTab(layoutId, tabId): Promise<boolean>
```

---

## 3. Custom Hooks (src/hooks/)

### 구조
```
hooks/
├── index.ts       # Hooks 내보내기
├── useCamera.ts   # 카메라 훅
├── useEvent.ts    # 이벤트 훅
├── useLayout.ts   # 레이아웃 훅 ⭐ (Grid Agent와 협업)
└── useAPI.ts      # API 에러 처리 훅
```

### 3.1 useCamera()

```typescript
const {
  // State
  cameras,
  selectedCamera,
  selectedCameraId,
  loading,
  error,

  // Actions
  loadCameras,
  loadCameraDetail,
  createCamera,
  updateCamera,
  deleteCamera,
  selectCamera,
  clearSelectedCamera,
  clearError,
} = useCamera()
```

**사용 예시:**
```typescript
function CameraList() {
  const { cameras, loading, loadCameras } = useCamera()
  
  useEffect(() => {
    loadCameras()
  }, [loadCameras])
  
  return loading ? <Spinner /> : <List data={cameras} />
}
```

### 3.2 useEvent()

```typescript
const {
  // State
  events,
  selectedEvent,
  alertSettings,
  pagination,
  loading,
  error,
  filter,

  // API Actions
  loadEvents,
  loadCameraEvents,
  acknowledgeEvent,
  acknowledgeEvents,
  deleteEvent,
  loadAlertSettings,
  createAlertSetting,
  updateAlertSetting,
  deleteAlertSetting,

  // Local State Actions
  setFilter,
  addEventLocal,
  updateEventLocal,
  acknowledgeEventLocal,
  clearError,
} = useEvent()
```

### 3.3 useLayout() ⭐ (Grid Agent와 협업)

```typescript
const {
  // State
  layout,
  activeTab,
  loading,
  error,

  // Actions
  loadLayout,
  setActiveTab,
  addTab,
  removeTab,
  updateGridConfig,
  updateCameraPositions,
} = useLayout(userId)
```

**사용 예시:**
```typescript
function GridComponent() {
  const { layout, updateCameraPositions } = useLayout(userId)
  
  const handleDragEnd = (result) => {
    updateCameraPositions(activeTabId, newPositions)
  }
}
```

### 3.4 useAPI()

**일반 API 요청:**
```typescript
const { request, loading, error, clearError } = useAPI()

const handleSubmit = async (data) => {
  const result = await request(() => apiCall(data))
}
```

**재시도 로직 포함:**
```typescript
const { requestWithRetry, retryCount } = useAPI({ retries: 3 })

const result = await requestWithRetry(() => failableApiCall(), 5)
```

**조건부 재시도:**
```typescript
const { retryableRequest } = useRetryableAPI({
  shouldRetry: (error) => error.code === 'TIMEOUT'
})
```

**간단한 액션:**
```typescript
const { execute, loading, error } = useAsyncAction()

const handleClick = async () => {
  await execute(async () => {
    await apiClient.post('/action', data)
  })
}
```

---

## 4. Type Definitions (src/types/)

### 주요 타입

**Camera:**
```typescript
interface Camera {
  id: number
  name: string
  location: string
  zone: string
  streamUrl: string
  status: 'online' | 'offline' | 'error'
  lastSeen?: Date
  resolution?: string
  fps?: number
}

interface CameraDetail extends Camera {
  stream?: Stream
  alerts?: number
  recordingEnabled: boolean
}
```

**Event:**
```typescript
interface Event {
  id: number
  cameraId: number
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: Date
  acknowledged: boolean
  metadata?: Record<string, unknown>
}
```

**Layout:**
```typescript
interface GridConfig {
  rows: number
  cols: number
  layout: 'grid' | 'custom' | 'focus'
  gapSize: number
}

interface Tab {
  id: string
  name: string
  cameras: number[]
  gridConfig: GridConfig
  cameraPositions: CameraPosition[]
  createdAt: Date
  updatedAt: Date
}

interface Layout {
  id: number
  userId: number
  tabs: Tab[]
  activeTab: string
  createdAt: Date
  updatedAt: Date
}
```

**API Response:**
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}
```

---

## 5. 협업 포인트

### Grid Agent와 협업
- **layoutSlice.ts**: 레이아웃 상태 관리
- **useLayout.ts**: 레이아웃 데이터 및 작업
- **layoutService.ts**: 레이아웃 API 호출

**통신 포인트:**
1. Grid Agent는 `useLayout` 훅으로 상태 구독
2. `updateGridConfig()`, `updateCameraPositions()` 으로 상태 변경
3. Redux via `dispatch(updateLayout(...))` 로 백엔드 동기화

### Pages Agent와 협업
- 모든 Redux slices 구독 가능
- Actions 디스패치로 상태 변경

### StreamPlayer Agent와 협업
- `useCamera()` 훅으로 카메라 상태 구독
- `selectedCamera`, `selectedCameraId` 구독
- 선택된 카메라의 스트림 데이터 활용

---

## 6. 사용 가이드

### 기본 패턴

**데이터 조회:**
```typescript
function MyComponent() {
  const { cameras, loading, error, loadCameras } = useCamera()

  useEffect(() => {
    loadCameras()
  }, [loadCameras])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <List data={cameras} />
}
```

**데이터 수정:**
```typescript
async function updateCamera(id, data) {
  const result = await updateCamera(id, data)
  if (result) {
    // 성공 처리
  } else {
    // 에러 처리
  }
}
```

**에러 처리:**
```typescript
const { events, error, clearError } = useEvent()

useEffect(() => {
  if (error) {
    showNotification(error)
    clearError()
  }
}, [error, clearError])
```

**필터링:**
```typescript
const { events, filter, setFilter } = useEvent()

const handleFilterChange = (newFilter) => {
  setFilter(newFilter)
  loadEvents(newFilter)
}
```

---

## 7. 환경 설정

**환경 변수 (.env):**
```
VITE_API_URL=http://localhost:8080/api
```

**Store Configuration (store/index.ts):**
- Redux Toolkit with async thunks
- Serialization 체크 비활성화 (Date 타입)
- DevTools 활성화 (개발 환경)

---

## 8. 테스트 전략

각 계층별 테스트 디렉토리:
- `store/slices/__tests__/`
- `services/__tests__/`
- `hooks/__tests__/`

**테스트 방식:**
- Redux slices: reducer tests + async thunk tests
- Services: API client mocking (msw or jest.mock)
- Hooks: renderHook + Redux provider

---

## 9. 성능 최적화

### 메모리 최적화
- `useCallback` 사용으로 무한 디스패치 방지
- Selector memoization (useAppSelector)

### 렌더링 최적화
- Slice별 세분화 (필요한 부분만 구독)
- 비동기 작업은 컴포넌트 외부에서 처리

### 네트워크 최적화
- Axios 요청 인터셉터로 토큰 자동 포함
- 재시도 로직 (useAPI, useRetryableAPI)
- 배치 연산 (acknowledgeEvents, deleteEvents)

---

## 10. 마이그레이션 가이드

### 기존 코드 마이그레이션
```typescript
// Before
const cameras = await apiClient.get('/cameras')

// After
const { cameras, loading } = useCamera()
useEffect(() => {
  loadCameras()
}, [loadCameras])
```

### 컴포넌트 업데이트 체크리스트
- [ ] Redux hooks 사용 (`useCamera`, `useEvent`, `useLayout`)
- [ ] 에러 처리 추가
- [ ] 로딩 상태 UI
- [ ] 캐싱 고려 (필요시)

---

## 요약

✅ Redux Store 구성 완료
- 4개 slices (camera, event, layout, ui)
- Async thunks + 로컬 reducers
- TypeScript strict mode 준수

✅ API Client 구성 완료
- Axios 기반 통일된 인터페이스
- 요청/응답 인터셉터
- 에러 정규화

✅ Custom Hooks 구성 완료
- 4개 main hooks (useCamera, useEvent, useLayout, useAPI)
- 재사용 가능한 패턴
- 에러 처리 & 로딩 상태

✅ 협업 준비 완료
- Grid Agent: layoutSlice + useLayout
- Pages Agent: 모든 hooks 활용 가능
- StreamPlayer Agent: useCamera 구독

모든 코드는 TypeScript strict mode를 준수하며, Redux Toolkit의 모범 사례를 따릅니다.
