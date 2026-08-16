# BMAD -> Spec Kit 마이그레이션 계획

작성일: 2026-08-16

## 목표

BMAD Method 실행 체계를 제거하고, 화면 확대 보기 기능의 요구사항/계획/작업 기준을 GitHub Spec Kit artifact로 전환한다.

## 루프 엔지니어링 전략

마이그레이션은 한 번에 삭제하지 않고 다음 루프를 반복한다.

1. **수집**: BMAD 산출물, 현재 코드, 사용자 대화에서 유지할 지식을 수집한다.
2. **승격**: 유지할 지식을 `specs/003-camera-focus-view/`의 Spec Kit artifact로 옮긴다.
3. **검증**: `scripts/verify-speckit-migration.ps1`로 필수 파일, 참조 경로, 핵심 문구를 확인한다.
4. **삭제**: 검증 통과 후 BMAD 실행 폴더와 agent 파일을 제거한다.
5. **회귀 확인**: frontend 테스트와 build를 실행한다.
6. **커밋**: 각 루프의 안정 지점을 커밋한다.

## 하네스 엔지니어링 전략

`scripts/verify-speckit-migration.ps1`는 다음을 확인한다.

- `.specify/feature.json`이 `specs/003-camera-focus-view`를 가리키는지
- `spec.md`, `plan.md`, `tasks.md`, contracts, quickstart가 존재하는지
- `spec.md`가 참고 이미지/기능 요구사항 중심 구조를 유지하는지
- `plan.md`가 Mock-First MVP 원칙을 포함하는지
- `AGENTS.md`, `CLAUDE.md`, Copilot 지침이 constitution 참조 구조를 유지하는지
- `-AfterBmadRemoval` 모드에서는 BMAD 폴더와 tracked BMAD 파일이 제거되었는지

## 이관 대상

- `_bmad-output/planning-artifacts/prd-camera-focus-view.md` -> `spec.md`
- `_bmad-output/planning-artifacts/architecture/**` -> `plan.md`, `contracts/`
- `_bmad-output/planning-artifacts/ux-designs/**` -> `spec.md`, `quickstart.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -> `tasks.md`
- `_bmad-output/implementation-artifacts/*.md` -> `tasks.md` 세부 근거

## 삭제 대상

검증 통과 후 삭제한다.

- `_bmad/`
- `_bmad-output/`
- `.agents/skills/bmad-*`
- `.claude/skills/bmad-*`
- `.github/agents/bmad-*.agent.md`

## 유지 대상

- `.specify/`
- `specs/003-camera-focus-view/`
- `.agents/skills/speckit-*`
- `.claude/skills/speckit-*`
- `.github/agents/speckit.*.agent.md`
- `.github/prompts/speckit.*.prompt.md`
- `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`

## 현재 루프 상태

- Spec Kit 설치: 완료
- Spec Kit workflow/templates 한국어 튜닝: 완료
- 화면 확대 보기 Spec Kit artifact 생성: 완료
- Migration harness 작성: 완료
- BMAD 삭제: 완료
- frontend test/build: 완료
