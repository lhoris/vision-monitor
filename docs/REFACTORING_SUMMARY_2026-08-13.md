# Refactoring Summary - 2026-08-13

## Architecture Summary

The current project is split into:

- `frontend/`: Vite, React, TypeScript, Redux Toolkit, Axios services, stream player components.
- `backend/`: Spring Boot, Maven, REST controllers, application services, repositories.
- `docs/`: architecture, API, implementation, and planning documents.
- `scripts/`: project helper scripts.

The frontend live monitoring flow is currently:

```text
Live page
  -> mock live monitoring data
  -> GridContainer
  -> DraggableCell
  -> LiveStreamPlayer
  -> iframe stream page adapter or StreamPlayerComponent
  -> protocol player implementation
```

The streaming boundary is now:

```text
Grid UI
  -> LiveStreamPlayer
  -> streaming/config
  -> go2rtc stream page or HLS/WebRTC/RTSP player
```

`DraggableCell` no longer needs to know the go2rtc `stream.html?src=...` URL rule.

Grid camera placement is now centralized in `frontend/src/components/Grid/useGridDnd.ts`.
The file no longer depends on `react-beautiful-dnd`, and TypeScript now builds it as part of the normal frontend source tree.

Layout active tab state is synchronized between the Redux slice field and the persisted `Layout.activeTab` field.
Reducer tests now protect active tab restoration and fallback behavior when tabs or subtabs are removed.

Layout persistence payload calculation is centralized in `frontend/src/hooks/layoutMutations.ts`.
`useLayout` now computes the next layout payload before save/update calls instead of sending the stale pre-dispatch layout object.

`layoutService` now exposes the development fallback layout creator and uses one response-unwrapping path for layout and tab API calls.
Tests protect fetch fallback behavior and null/false results from failed write/delete calls.

`cameraService`, `eventService`, and `layoutService` share service-local response/fallback helpers in `frontend/src/services/serviceUtils.ts`.
This keeps the current fallback behavior while removing repeated try/catch and response unwrap code from individual methods.

`StreamPlayerComponent` now uses stable event listener references for subscription cleanup and avoids resubscribing `timeupdate` on every stats update.
Mousemove control-hide timers are also cleared during effect cleanup.

`useStreamPlayer` now isolates each player lifecycle with a generation token.
When the source URL or protocol changes, the hook clears the stats interval, removes old media elements, destroys the previous player, resets visible state, and ignores stale async callbacks from older players.
The hook also stores inline player config in a ref so parent re-renders do not accidentally recreate the stream player.

Concrete HLS/WebRTC/RTSP player implementations now keep DOM and peer-connection event listener references and remove them during destroy.
This prevents destroyed player instances from reacting to later video or canvas events.

`LiveStreamPlayer` now remounts the active stream renderer when the browser page resumes after being hidden or blurred.
This gives go2rtc iframe stream pages and native player components a clean recovery path after browser minimize/restore cycles.

The header theme control now supports three presentation themes instead of a light/dark toggle.
Theme state is stored as `theme1`, `theme2`, or `theme3`; `theme2` and `theme3` continue to use Tailwind dark-mode compatibility while `data-theme` drives theme-specific CSS variables and overrides.

## Dependency Rules

- Pages may compose feature components and dispatch store actions.
- Grid components should only handle layout, drag/drop, and camera placement UI.
- Streaming URL rules and media-server-specific detection belong under `src/streaming`.
- Player lifecycle and protocol details belong under `src/components/StreamPlayer`.
- Mock/demo live-monitoring data belongs under `src/mocks` until it is replaced by backend API data.
- Backend controllers should depend on services, not repositories directly.

## External Integrations

- Media server: current live camera URLs target go2rtc stream pages at `VITE_STREAM_PAGE_BASE_URL`, defaulting to `http://220.81.187.50:1984`.
- Camera streams: current mock data maps Camera 1-7 to `video_high1` through `video_high7`.
- Database: backend is structured for MariaDB through Spring Data JPA.
- AI/VMS/overlay paths are not yet implemented as production integrations in the inspected runtime flow.

## Development Guide

- Add new stream URL construction or media-server detection in `frontend/src/streaming/config.ts`.
- Add new live player rendering strategy in `frontend/src/components/StreamPlayer/LiveStreamPlayer.tsx`.
- Keep grid cells unaware of protocol-specific player details.
- Replace `frontend/src/mocks/liveMonitoring.ts` with service-backed data when the backend layout/camera APIs become the source of truth.
- Protect stream URL and player adapter changes with tests under `src/streaming/__tests__` and `src/components/StreamPlayer/__tests__`.

## Validation

- `npm run build`: passed.
- `npm test -- --run`: passed, 18 files and 128 tests.
- `mvn test`: passed.
- `npm run lint`: blocked because `eslint` is referenced by the script but not installed.

## Remaining Technical Debt

- `eslint` is not installed even though `npm run lint` exists.
- npm dependency tree required `--legacy-peer-deps` to add `jsdom`; React 19 peer compatibility should be reviewed.
- npm audit reported existing vulnerabilities after install.
- Live monitoring still uses mock data; backend camera/layout integration remains a future refactor.
- API failure handling is still service-local and console-based across services; a shared user-visible error/reporting policy is still needed before production hardening.
