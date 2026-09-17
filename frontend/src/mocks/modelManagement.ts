import type { ModelEventLog, ModelProcess, ProcessArea } from '@/types/modelManagement'

export const mockProcessAreas: ProcessArea[] = [
  { id: 'all', name: 'ALL', sortOrder: 0, isAll: true },
  { id: 'heating', name: '가열', sortOrder: 1 },
  { id: 'rolling', name: '압연', sortOrder: 2 },
  { id: 'wire', name: '선재', sortOrder: 3 },
  { id: 'finishing', name: '정정', sortOrder: 4 },
]

export const mockModelProcesses: ModelProcess[] = [
  { id: 'model-001', processId: 'heating', processName: '가열', modelName: '가열로 스키드 감시', automationName: '가열로 이상감지', serverIp: '10.20.4.21', pythonProjectPath: '/opt/vision/heating/skid-monitor', processStatus: 'running', monitoringStatus: 'normal', controlStatus: 'normal', lastStatusAt: '2026-09-17T08:45:00+09:00' },
  { id: 'model-002', processId: 'rolling', processName: '압연', modelName: '압연 설비 이상감지', automationName: '압연 이상감지', serverIp: '10.20.4.22', pythonProjectPath: '/opt/vision/rolling/equipment-monitor', processStatus: 'running', monitoringStatus: 'normal', controlStatus: 'failed', lastStatusAt: '2026-09-17T08:43:00+09:00' },
  { id: 'model-003', processId: 'wire', processName: '선재', modelName: '선재 표면 결함감지', automationName: '선재 결함감지', serverIp: '10.20.4.23', pythonProjectPath: '/opt/vision/wire/surface-defect', processStatus: 'error', monitoringStatus: 'failed', controlStatus: 'checking', lastStatusAt: '2026-09-17T08:40:00+09:00' },
  { id: 'model-004', processId: 'finishing', processName: '정정', modelName: '정정 공정 품질감시', automationName: '정정 품질감시', serverIp: '10.20.4.24', pythonProjectPath: '/opt/vision/finishing/quality-monitor', processStatus: 'stopped', monitoringStatus: 'unknown', controlStatus: 'normal', lastStatusAt: undefined },
]

export const mockModelEventLogs: ModelEventLog[] = [
  { id: 'log-001', modelProcessId: 'model-001', occurredAt: '2026-09-17T08:45:00+09:00', severity: 'info', message: 'Python 프로세스 heartbeat 수신', detectionSummary: 'alive=true' },
  { id: 'log-002', modelProcessId: 'model-002', occurredAt: '2026-09-17T08:43:00+09:00', severity: 'error', message: '제어 연동 호출 실패', detectionSummary: 'connection timeout' },
  { id: 'log-003', modelProcessId: 'model-003', occurredAt: '2026-09-17T08:40:00+09:00', severity: 'warning', message: 'Agent heartbeat 미수신', detectionSummary: 'last-seen 5분 전' },
]

export function cloneModelProcesses(): ModelProcess[] {
  return mockModelProcesses.map((item) => ({ ...item }))
}
