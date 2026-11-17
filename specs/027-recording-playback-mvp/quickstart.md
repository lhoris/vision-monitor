# 검증 가이드: 화면 확대 보기 녹화 재생 MVP

## 준비

1. 녹화 서버 접근이 가능한 환경인지 확인한다.
2. 저장소 루트에서 `scripts\develop.bat`로 backend와 frontend를 함께 실행한다.
3. 브라우저에서 `http://localhost:3000`에 접속해 로그인한다.

## 수동 검증

1. 라이브 대시보드에서 영상 하나를 선택해 `화면 확대 보기`로 이동한다.
2. `녹화` 탭을 선택한다.
3. 기본 입력값이 `2026-11-17 07:29:31` ~ `07:30:01`인지 확인한다. 검증 대상 영상은 `video6`이다.
4. 녹화 조회를 실행하고 MP4 플레이어가 표시되는지 확인한다.
5. 플레이어의 기본 재생바로 구간 내 위치를 이동한다.
6. 알람 목록 또는 이벤트에서 알람을 선택해 알람 시각 전후 구간으로 입력값이 바뀌는지 확인한다.
7. 녹화 서버가 응답하지 않거나 범위를 잘못 입력했을 때 한국어 오류 안내가 표시되는지 확인한다.

## 자동 검증

```powershell
cd frontend
npm run test -- --run src/services/__tests__/recordingService.test.ts src/components/CameraFocus/__tests__/FocusVideoStage.test.tsx src/pages/__tests__/CameraFocus.test.tsx
npm run build
```
