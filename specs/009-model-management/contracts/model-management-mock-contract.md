# Mock Contract: 모델 관리

이 계약은 화면 퍼블리싱 MVP에서 사용할 frontend mock service 기준이다. 후속 Spring Boot API 전환 시 endpoint 이름은 달라질 수 있으나 payload shape와 상태 의미는 유지한다.

## 타입

```ts
type ProcessStatus = 'running' | 'stopped' | 'error' | 'restarting' | 'unknown'
type LinkStatus = 'normal' | 'failed' | 'checking' | 'unknown'
type ModelControlAction = 'start' | 'stop' | 'restart'
```

## listProcesses

```ts
listProcesses(): Promise<{
  processes: ModelProcess[]
  processAreas: ProcessArea[]
}>
```

- `monitoringStatus`는 실제 전환 시 DB에 저장된 Python 프로세스 alive 상태를 의미한다.
- `controlStatus`는 실제 전환 시 DB에 저장된 제어 연동 통신 성공/실패 상태를 의미한다.

## updateSettings

```ts
updateSettings(id: string, input: ModelSettingsInput): Promise<ModelProcess>
```

- `serverIp`와 `pythonProjectPath`를 갱신한다.
- 입력값이 비어 있으면 validation 오류를 반환한다.

## controlProcess

```ts
controlProcess(id: string, action: ModelControlAction): Promise<ModelProcess>
```

- `start`: `processStatus`를 `running`으로 변경한다.
- `stop`: `processStatus`를 `stopped`로 변경한다.
- `restart`: `processStatus`를 `restarting`으로 표시한 뒤 완료 상태를 `running`으로 변경한다.
- MVP에서는 실제 Python 프로세스를 제어하지 않는다.

## listEventLogs

```ts
listEventLogs(modelProcessId: string): Promise<ModelEventLog[]>
```

- 특정 모델의 mock 이벤트 로그 목록을 반환한다.
- 로그가 없으면 빈 배열을 반환한다.

## createProcess

```ts
createProcess(input: ModelCreateInput): Promise<ModelProcess>
```

- 신규 모델 프로세스를 mock 목록에 추가한다.
- 추가된 모델은 기본적으로 `processStatus: 'unknown'`, `monitoringStatus: 'checking'`, `controlStatus: 'checking'` 상태로 시작한다.

## 오류

```ts
interface ModelManagementError {
  code: 'VALIDATION_ERROR' | 'MODEL_NOT_FOUND' | 'ACTION_BLOCKED'
  message: string
}
```

- `VALIDATION_ERROR`: 필수값 누락 또는 형식 오류
- `MODEL_NOT_FOUND`: 대상 모델 없음
- `ACTION_BLOCKED`: mock 조작 중복 실행 차단
