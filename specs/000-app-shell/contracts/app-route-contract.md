# 계약: 앱 route shell

## 목적

로그인 이후 보호 화면이 공통 앱 뼈대를 공유하고, 인증 상태에 따라 route를 분기하는 규칙을 정의한다.

## 인증되지 않은 상태

- `/login`은 로그인 화면을 표시한다.
- `/live`, `/playback`, `/events`, `/settings`, `/live/cameras/{cameraId}` 접근 시 `/login`으로 이동한다.
- 알 수 없는 route도 `/login`으로 이동한다.

## 인증된 상태

- `/`는 `/live`로 이동한다.
- `/live`는 AppLayout 안에서 라이브 메인 화면을 표시한다.
- `/live/cameras/{cameraId}`는 AppLayout 안에서 화면 확대 보기를 표시한다.
- `/playback`은 AppLayout 안에서 녹화 화면을 표시한다.
- `/events`는 AppLayout 안에서 이벤트 화면을 표시한다.
- `/settings`는 AppLayout 안에서 설정 화면을 표시한다.
- 알 수 없는 보호 route는 `/live`로 이동한다.

## 규칙

- 보호 화면은 Header, Sidebar, main content 구조를 공유한다.
- 로그인 화면은 AppLayout으로 감싸지 않는다.

