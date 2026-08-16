# 참고 이미지 및 원문 자료

이 디렉터리는 앱 기본 뼈대 기능 명세에 사용되는 현업 PPT 캡처, 공통 레이아웃 스케치, 기존 화면 캡처를 보관한다.

현재 명세는 기존 구현된 `AppLayout`, `Header`, `Sidebar`, routing 구조와 사용자 대화에서 확인된 "로그인 후 기본 뼈대" 필요성을 기준으로 작성했다.

## Active 자료

- [admin-menu-communication-model-01.png](admin-menu-communication-model-01.png): 관리자 메뉴 초안. 화면 수정, 통신 및 모델 수정, 접속 권한 관리 영역이 함께 표시된 원문 캡처.
- [admin-menu-communication-model-02.png](admin-menu-communication-model-02.png): 같은 관리자 메뉴 초안의 중복 캡처. 원문 보존용.

## 해석 기준

- 화면 수정 영역의 `공정 추가`, `세부 공정 수정`, `화면 배치 수정`은 최신 요구사항에서 sidebar 메뉴로 사용하지 않는다. 라이브 대시보드 내부 편집 기능으로 분리한다.
- 통신 및 모델 수정 영역의 메뉴는 관리자 메뉴로 유지한다.
- 접속 권한 관리는 사용자, 역할, 권한 정책, 메뉴 접근 제어처럼 권한 관리에 필요한 일반적인 하위 메뉴로 재정의한다.
