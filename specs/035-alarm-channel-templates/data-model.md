# 데이터 모델

## AlarmRule

기존 알람 기준. 채널별 템플릿을 보유한다.

- `appMessageTemplate`: 앱 알람 텍스트
- `emailSubjectTemplate`: 이메일 제목
- `emailBodyTemplate`: 이메일 본문 또는 HTML
- `teamsMessageTemplate`: 팀즈 메시지

## AlarmRequest

발생한 알람의 원장이다. `context`는 JSON 문자열로 저장하며 템플릿 치환의 입력이 된다.

## AlarmLog

수신자별 결과 로그다. 기존 앱 메시지와 함께 이메일 제목·본문·팀즈 메시지를 보존한다.

## TemplateContext

기본 변수는 `message`, `alarmCode`, `severity`, `sourceType`, `sourceId`, `modelProcessId`, `occurredAt`이며, 이 목록에 한정하지 않고 요청 metadata의 임의 키를 추가 변수로 사용할 수 있다.
