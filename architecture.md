# Vision Monitor - Architecture Document

## Requirements

### Functional Requirements
1. **Authentication**
   - Login page with hardcoded credentials (tester/tester123)
   - Mock authentication using localStorage
   - Session persistence across page refreshes
   - Logout functionality

2. **Dashboard**
   - Professional dark-themed manufacturing dashboard
   - Real-time CCTV monitoring interface
   - Header with current time, user info, connection status
   - Summary cards (Total Cameras, Connected, Abnormal)

3. **CCTV Grid**
   - Display exactly 6 CCTV camera cards
   - Responsive grid layout (3 columns on desktop, responsive on mobile)
   - Video streaming area with fallback display
   - Live status indicators

### Non-Functional Requirements
1. **Performance**
   - Clock updates must not trigger re-renders of CCTV cards
   - Optimized component isolation
   - No unnecessary re-renders

2. **Code Quality**
   - No TypeScript errors or "any" types
   - Clean folder structure
   - No code duplication
   - Type-safe implementation

3. **Stability**
   - No console errors
   - No runtime crashes
   - Successful build without errors

## Folder Structure

```
vision-monitor/
├── src/
│   ├── components/
│   │   ├── App.tsx              # Main app component with routing logic
│   │   ├── LoginPage.tsx        # Login form and authentication
│   │   ├── DashboardPage.tsx    # Dashboard container
│   │   ├── Header.tsx           # Header with time, user, status
│   │   ├── Clock.tsx            # Isolated clock component
│   │   ├── SummaryCards.tsx     # Status summary cards
│   │   ├── CameraGrid.tsx       # Grid container for camera cards
│   │   ├── CameraCard.tsx       # Individual camera card
│   │   ├── VideoPanel.tsx       # Video display component
│   │   └── EmptyVideo.tsx       # Fallback video placeholder
│   ├── hooks/
│   │   └── useAuth.ts           # Authentication state management
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── styles/
│   │   ├── global.css           # Global styles
│   │   ├── App.module.css       # App component styles
│   │   ├── Header.module.css    # Header styles
│   │   ├── CameraGrid.module.css # Camera grid styles
│   │   └── CameraCard.module.css # Camera card styles
│   ├── utils/
│   │   └── mockData.ts          # Mock camera data
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite environment types
├── public/
│   └── sample.mp4               # Sample video file (optional)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── architecture.md
└── README.md
```

## Component Tree

```
App
├── LoginPage
│   └── [form inputs]
└── DashboardPage
    ├── Header
    │   ├── Clock (memoized to prevent re-renders)
    │   ├── User Info
    │   └── Status Badge
    ├── SummaryCards
    │   ├── Total Cameras Card
    │   ├── Connected Card
    │   └── Abnormal Card
    └── CameraGrid
        ├── CameraCard (x6)
        │   ├── Camera Info
        │   ├── VideoPanel
        │   │   ├── Video Element
        │   │   └── EmptyVideo (fallback)
        │   └── Status Indicator
```

## State Management

### Local State (using React Hooks)

1. **Authentication State (useAuth hook)**
   - `isLoggedIn: boolean` - Authentication status
   - `userName: string` - Current logged-in user
   - `login(username, password): boolean` - Login function
   - `logout(): void` - Logout function
   - Persisted in `localStorage` with key `visionMonitor:auth`

2. **Clock State (Clock component)**
   - `currentTime: Date` - Updated every second
   - Isolated in Clock component using `useEffect` with cleanup

3. **Dashboard State (DashboardPage component)**
   - `cameraData: Camera[]` - Static camera configuration
   - `connectionStatus: 'connected' | 'disconnected'` - Connection state

## Future Integration Points

1. **Backend API Integration**
   - Replace mock authentication with API calls
   - `/api/auth/login` endpoint
   - `/api/auth/logout` endpoint
   - `/api/auth/verify` endpoint for session validation

2. **Camera Stream Integration**
   - MediaMTX or WebRTC integration through isolated `VideoPanel` component
   - Replace HTML `<video>` with WebRTC adapter
   - Real-time stream status from backend

3. **Real-time Data**
   - WebSocket connection for camera status updates
   - Real-time abnormal event detection
   - Dynamic summary card updates

4. **Database Integration**
   - Camera configuration storage
   - User management
   - Event logging and history

## Implementation Plan

### Phase 1: Setup (Current)
- ✓ Initialize Vite + React 19 + TypeScript project
- ✓ Create folder structure
- ✓ Create architecture document

### Phase 2: Core Components
1. Implement type definitions
2. Implement useAuth hook
3. Implement LoginPage component
4. Implement Clock component (memoized)
5. Implement Header component
6. Implement SummaryCards component
7. Implement VideoPanel and EmptyVideo components
8. Implement CameraCard component
9. Implement CameraGrid component
10. Implement DashboardPage component
11. Implement App component with conditional rendering

### Phase 3: Styling & Layout
- Create global dark theme CSS
- Style each component with CSS Modules
- Ensure professional manufacturing dashboard appearance
- Test responsive layout

### Phase 4: Testing & QA
- Test login/logout flow
- Test session persistence across refresh
- Verify no TypeScript errors
- Verify no console errors
- Test responsive layout
- Performance verification (clock doesn't trigger camera re-renders)

### Phase 5: Documentation
- Create README.md
- Document how to run the project
- Document test account credentials
- Document future integration points

## Key Design Decisions

1. **CSS Modules over CSS-in-JS**: Ensures predictable styling without runtime overhead
2. **useAuth Hook**: Centralized authentication logic for potential future API integration
3. **Isolated Clock Component**: Prevents unnecessary re-renders of other components
4. **VideoPanel Abstraction**: Enables easy future replacement with WebRTC/MediaMTX implementations
5. **Mock Data Structure**: Designed to match expected backend API response format
6. **localStorage for Auth**: Simple persistence without backend dependency for demo purposes

## Performance Considerations

1. **Clock Memoization**
   - `React.memo` on Clock component
   - Only updates when time actually changes
   - Prevents parent re-render propagation

2. **CameraCard Memoization**
   - Prevent unnecessary re-renders when other cards update
   - Use `React.memo` with shallow comparison

3. **Event Handler Optimization**
   - Use `useCallback` for event handlers passed to children
   - Minimize dependency arrays

## Dark Theme Color Palette

- **Background**: #0f0f0f (charcoal black)
- **Surface**: #1a1a1a (dark gray)
- **Border**: #333333 (mid gray)
- **Text Primary**: #e0e0e0 (light gray)
- **Text Secondary**: #808080 (medium gray)
- **Accent**: #4a9eff (industrial blue)
- **Success**: #4ade80 (green)
- **Alert**: #ef4444 (red)

## Build & Deployment

- Build command: `npm run build`
- Dev command: `npm run dev`
- Target: Modern browsers (ES2020+)
- Output directory: `dist/`
