# 구현 계획

## 기술 구조

- 백엔드: Spring Boot REST Controller, JPA Entity/Repository/Service, Flyway V006
- 프론트엔드: 기존 관리자 라우트와 사용자관리 화면의 표 중심 레이아웃을 참고한 단순 영상 관리 화면
- 검증: 백엔드 단위 테스트, Flyway DDL 정적 검사, 프론트엔드 TypeScript 빌드 및 기존 테스트

## API

- `GET /api/video-sources`
- `POST /api/video-sources`
- `PUT /api/video-sources/{id}`
- `DELETE /api/video-sources/{id}`

## 범위 원칙

이번 구현은 주소 등록·조회·수정·삭제만 포함한다. 재생 상태나 외부 스트리밍 서버를 확인하는 로직은 만들지 않는다.
