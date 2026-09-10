# 데이터 모델

## TB_M26_VIDEO_SOURCE

| 컬럼 | 의미 | 비고 |
|---|---|---|
| VIDEO_SOURCE_ID | 영상 주소 식별자 | PK, 자동 증가 |
| VIDEO_NAME | 화면 표시 이름 | 애플리케이션 필수 |
| VIDEO_URL | 재생 주소 | 애플리케이션 필수, 중복 검증 |
| VIDEO_PROTOCOL | WEBRTC, RTSP, HLS | 애플리케이션 허용 목록 |
| LOCATION | 설치 위치 | 선택 |
| ZONE_NAME | 구역 | 선택 |
| STATUS | ACTIVE 또는 INACTIVE | 기본 ACTIVE |
| REMARKS | 비고 | 선택 |

공통 생성·수정 감사 컬럼은 M26 테이블 규칙을 따른다. DB에는 `VIDEO_SOURCE_ID` PK 외의 제약조건을 생성하지 않는다.
