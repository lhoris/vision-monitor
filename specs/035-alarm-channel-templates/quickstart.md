# 검증 가이드

1. 알람 기준 관리에서 `USER_SIGNUP_REQUEST`를 선택한다.
2. 앱 메시지, 이메일 제목·본문, 팀즈 메시지에 각각 템플릿 변수를 입력하고 저장한다.
3. 회원가입 신청을 생성한다.
4. `TB_M26_ALARM_REQ`의 문맥과 `TB_M26_ALARM_LOG`의 채널별 결과를 확인한다.
5. 관리자 화면의 SSE 알람에 치환된 앱 메시지가 표시되는지 확인한다.
6. 템플릿을 비운 뒤 다시 가입신청하여 기존 메시지 fallback이 동작하는지 확인한다.

자동 검증:

- `backend/mvnw.cmd test`
- `frontend/npm run build`
