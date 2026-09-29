# Specification Quality Checklist: 쿼리 관리 메뉴

**Purpose**: 쿼리 관리 기능 명세의 완전성과 품질을 확인한다.

**Created**: 2026-09-30

**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] 구현 기술보다 사용자 가치와 업무 요구를 중심으로 작성됨
- [x] 관리자와 일반 사용자의 사용 범위가 구분됨
- [x] 기능 범위와 제외 범위가 명확함
- [x] 모든 필수 섹션이 작성됨

## Requirement Completeness

- [x] 미해결 `NEEDS CLARIFICATION` 항목이 없음
- [x] 요구사항이 테스트 가능하고 모호하지 않음
- [x] 성공 기준이 측정 가능함
- [x] 사용자 시나리오와 예외 조건이 정의됨
- [x] 데이터 및 Audit 규칙이 정의됨
- [x] 물리 FK 금지 규칙이 반영됨

## Feature Readiness

- [x] Query 등록, 수정, 활성화, 비활성화, 논리 삭제 흐름이 정의됨
- [x] 메타데이터 섹션과의 연계 계약이 정의됨
- [x] 조회 전용 SQL 보안 경계가 정의됨
- [x] 권한 및 오류 처리 요구사항이 정의됨

## Notes

- 기존 `017-camera-focus-metadata-query`가 정의한 `TB_M26_METADATA_QUERY`를 재사용한다.
- 다음 단계에서 구현 전 `plan.md`와 `tasks.md`를 작성한다.
