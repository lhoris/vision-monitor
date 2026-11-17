# 검증 가이드: 편집기형 녹화 재생 플레이어

## 준비

1. `scripts\develop.bat`로 backend와 frontend를 함께 실행한다.
2. `http://localhost:3000`에 접속하고 로그인한다.
3. 라이브 대시보드에서 영상 하나를 선택해 화면 확대 보기로 이동한다.

## 검증 시나리오

1. 녹화 탭을 선택한다.
2. 선택 날짜의 24시간 timeline과 work area가 표시되는지 확인한다.
3. work area 본체를 마우스로 이동하고 좌우 핸들을 각각 드래그한다.
4. 타임라인의 다른 위치를 클릭해 playhead가 이동하는지 확인한다.
5. 방향키와 Shift+방향키로 playhead/핸들을 이동한다.
6. 범위 조회/재생을 실행하고 `video6.mp4`가 선택 범위로 재생되는지 확인한다.
7. 알람 marker 또는 알람 목록을 클릭해 알람 전후 범위로 이동하는지 확인한다.
8. 날짜를 바꾼 뒤 이전 날짜의 marker와 player가 남지 않는지 확인한다.

## 자동 검증

```powershell
cd frontend
npm run test -- --run src/components/CameraFocus/__tests__/RecordingTimeline.test.tsx src/pages/__tests__/CameraFocus.test.tsx
npm run build
```
