# Quickstart: 영상소스별 Query 메타데이터

## 사전 조건

- Node.js 24.x와 npm 11.x
- 저장소 루트에서 실행

## 개발 실행

```powershell
scripts\develop.bat
```

frontend만 확인해야 할 때는 기존 프로젝트 절차에 따라 `frontend`에서 `npm run dev`를 사용할 수 있다. 기능 검증 완료 시에는 가능한 한 backend와 frontend를 함께 실행한다.

## 검증 시나리오

1. 확대 보기에서 영상소스 A를 연다.
2. 기본 profile의 text/grid 섹션과 각 섹션의 loading 또는 success 상태를 확인한다.
3. 섹션 설정에서 Query ID, 표시 필드, 5/10/30/60초 주기를 설정한다.
4. 섹션을 추가하고 삭제한 뒤 기본 설정 복원으로 되돌린다.
5. 두 섹션의 순서를 드래그앤드롭으로 바꾸고 화면을 다시 열어 순서가 유지되는지 확인한다.
6. 영상소스 B를 열어 A의 섹션 설정과 독립적인지 확인한다.
7. mock Query 오류를 발생시켜 한 섹션만 오류 상태가 되고 다른 섹션은 계속 표시되는지 확인한다.
8. 화면을 벗어나거나 source를 바꾼 뒤 polling timer가 정리되는지 확인한다.

## 자동 검증

```powershell
cd frontend
npm test -- --run src/components/CameraFocus/Metadata src/pages/__tests__/CameraFocus.test.tsx
npm run build
```

확인할 핵심 항목은 profile 격리, mapping, polling 중복 방지, timer cleanup, error isolation, drag order persistence다.
