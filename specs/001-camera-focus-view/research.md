# 리서치: 화면 확대 보기

**작성일**: 2026-08-16

## 결정 1: MVP는 frontend mock-first로 유지

**결정**: 화면 확대 보기 MVP는 Spring Boot 실제 API 없이 frontend mock service/mock adapter로 구현한다.

**근거**: 기존 구현과 BMAD sprint plan 모두 mock-only MVP를 전제로 재정렬되어 있다. 외부 VMS/Media Server/AI 계약이 확정되지 않은 상태에서 backend를 먼저 구현하면 contract 변경 비용이 커진다.

**검토한 대안**:

- 실제 Spring Boot API 선구현: 외부 시스템 계약 부재로 폐기
- frontend fixture만 사용하고 service 계층 생략: 후속 API 교체성이 낮아 폐기

## 결정 2: `streamUrl`과 `playbackUrl`은 opaque URL로 취급

**결정**: frontend는 media URL 구조를 업무 로직으로 해석하지 않는다.

**근거**: media distribution 책임은 외부 VMS/Media Server에 있다. frontend는 URL을 player에 전달하고 loading/error/fallback state를 표시하는 책임만 가진다.

**검토한 대안**:

- URL path/query를 해석해 업무 상태 판단: 외부 시스템 변경에 취약해 폐기

## 결정 3: 화면 확대 보기 명칭을 사용자-facing 용어로 유지

**결정**: 사용자-facing 문구는 "화면 확대 보기"를 우선 사용한다. 내부 파일/route/type에는 기존 `focus` 명칭을 유지할 수 있다.

**근거**: 사용자가 "카메라 집중 보기"보다 "화면 확대 보기"가 자연스럽다고 명시했다. 이미 코드에는 `CameraFocus` 명칭이 사용되고 있으므로 전체 rename은 불필요한 리스크가 있다.

**검토한 대안**:

- 내부 코드까지 전면 rename: 기능 변경과 무관한 대규모 churn으로 폐기

## 결정 4: BMAD 산출물은 migration source로만 보존

**결정**: BMAD 산출물의 요구사항과 구현 상태는 Spec Kit artifact로 승격하고, BMAD 실행 폴더와 agent 파일은 삭제 대상으로 둔다.

**근거**: 사용자는 BMAD의 복잡한 세션/프롬프트 복사 흐름을 중단하고 Spec Kit workflow로 전환하기로 결정했다.

**검토한 대안**:

- BMAD와 Spec Kit 병행: 지침 중복과 산출물 불일치 위험으로 폐기

