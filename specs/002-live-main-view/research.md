# 리서치: 라이브 메인 화면

## 결정 1: MVP layout 데이터는 frontend mock fixture와 fallback service로 유지

**결정**: 라이브 메인 화면의 공정탭, 세부공정탭, 그리드, 카메라 배치 데이터는 MVP에서 frontend mock fixture와 `layoutService` fallback을 기준으로 검증한다.

**근거**: 프로젝트 헌법이 Mock-First MVP를 요구하며, 현재 구현도 `createMockLayout`, `createMockCameras`, `layoutService` fallback을 사용한다.

**검토한 대안**: Spring Boot layout API 선구현. 현재 범위를 넓히고 DB migration까지 연결되므로 MVP에서는 제외한다.

## 결정 2: 카메라 타일 header와 video body를 분리

**결정**: 카메라명, 상태점, 확대 버튼은 영상 위 overlay가 아니라 타일 header에 둔다.

**근거**: 사용자가 영상 위 타이틀/메타데이터가 영상을 침범하는 구조를 부정적으로 봤고, 현재 구현도 영상 바깥 header 구조로 조정되어 있다.

**검토한 대안**: 영상 내부 overlay. 정보 확인은 빠르지만 영상 판독 영역을 가릴 수 있어 제외한다.

## 결정 3: 확대 보기 진입 정보는 route query로 전달

**결정**: `cameraId`, `mode`, `tabId`, `subTabId`, `cameraIds`, `cameraNames`를 route query로 전달한다.

**근거**: 003 화면 확대 보기와의 책임 경계를 명확히 하며, 새 global state를 추가하지 않아도 진입 맥락을 복원할 수 있다.

**검토한 대안**: 전역 store에 focus context 저장. 새 상태 수명 관리가 필요하고 reload/deep link 검증이 어려워진다.

## 결정 4: 카메라 이동은 native HTML5 drag/drop helper로 유지

**결정**: 현재 helper 기반 drag/drop을 유지하고 별도 DnD 라이브러리를 도입하지 않는다.

**근거**: 현 기능 범위는 셀 간 이동과 swap으로 충분하며, 기존 helper가 단위 테스트로 검증되어 있다.

**검토한 대안**: DnD 전용 라이브러리 도입. 접근성/고급 interaction에는 유리하지만 현재 MVP 범위 대비 복잡도가 높다.

