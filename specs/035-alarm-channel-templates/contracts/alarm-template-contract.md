# 알람 템플릿 계약

## 관리자 기준 응답 필드

```json
{
  "appMessageTemplate": "{{message}}",
  "emailSubjectTemplate": "[{{severity}}] {{alarmCode}}",
  "emailBodyTemplate": "<p>{{message}}</p>",
  "teamsMessageTemplate": "**{{alarmCode}}**\n{{message}}"
}
```

## 치환 규칙

- 기본 변수뿐 아니라 요청 metadata에 포함된 임의의 키를 `{{변수명}}` 형식으로 치환한다.
- 값이 없으면 빈 문자열로 치환한다.
- 템플릿이 비어 있으면 앱은 기존 `message`, 이메일 제목은 알람명, 이메일 본문과 팀즈 메시지는 기존 메시지를 사용한다.
