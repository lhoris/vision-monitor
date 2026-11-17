# 검증 가이드: 편집기형 녹화 재생 플레이어

## 최신 동작 확인

- 타임라인의 work area를 좌클릭 드래그하고 놓으면 해당 FROM~TO 범위로 영상이 자동 재조회·재생되는지 확인한다.
- 빠른 설정에서 `30초, 1분, 3분, 5분, 10분, 30분, 1시간, 3시간, 무한`을 선택하고 FROM은 유지되며 TO만 변경되는지 확인한다. 현재 선택된 버튼은 강조되어야 한다.
- 타임라인 위에서 일반 마우스 휠을 움직여 `1x`부터 `512x`까지 확대·축소되는지 확인한다.
- 영상 영역이 남은 공간을 채우고 타임라인이 영상 하단에 붙는지, 선택 구간 시간이 날짜 없이 `HH:mm:ss`로 표시되는지 확인한다.

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
