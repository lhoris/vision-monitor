# Quickstart: 라이브 메인 화면 검증

## 사전 조건

- Node.js와 npm이 설치되어 있어야 한다.
- repository root는 `C:\workspace\vision-monitor`이다.

## 실행

```powershell
cd frontend
npm install
npm run dev
```

브라우저에서 `/live`로 이동한다.

## 자동 검증

```powershell
cd frontend
npm test -- --run
npm run build
```

## 수동 검증 시나리오

### 1. 공정탭/세부공정탭 전환

1. `/live` 화면에 진입한다.
2. `Production Line A`, `Production Line B` 공정탭을 전환한다.
3. 각 공정탭의 세부공정탭 목록과 영상 그리드가 바뀌는지 확인한다.

**기대 결과**: 활성 탭이 명확히 표시되고 선택한 세부공정의 카메라 그리드가 표시된다.

### 2. 그리드 크기 변경

1. Grid selector를 연다.
2. 3x3, 2x3 등 다른 그리드 옵션을 선택한다.

**기대 결과**: 현재 세부공정탭의 셀 수와 Add Camera 영역이 선택한 그리드 크기에 맞게 변경된다.

### 3. 카메라 추가/이동/삭제

1. 빈 셀의 Add Camera를 선택한다.
2. 카메라 선택 창에서 사용 가능한 카메라를 선택한다.
3. 배치된 카메라를 다른 셀로 드래그한다.
4. 카메라 타일에서 우클릭 후 Remove를 선택한다.

**기대 결과**: 카메라가 중복 없이 추가되고, 이동/교환/삭제가 현재 세부공정탭에만 반영된다.

### 4. Rename

1. 카메라 타일 제목을 우클릭한다.
2. Rename을 선택한다.
3. 새 제목을 입력하고 저장한다.

**기대 결과**: 타일 제목이 즉시 변경되고, theme1/theme2/theme3에서 dialog 글자가 명확히 보인다.

### 5. 화면 확대 보기 진입

1. 특정 세부공정탭에서 카메라 타일에 마우스를 올린다.
2. 확대 버튼을 선택한다.

**기대 결과**: `/live/cameras/{cameraId}`로 이동하고, query에는 현재 `tabId`, `subTabId`, 현재 세부공정탭의 `cameraIds`, Rename된 `cameraNames`가 포함된다.

