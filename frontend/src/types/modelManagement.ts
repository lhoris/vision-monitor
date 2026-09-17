export type ProcessStatus = 'running' | 'stopped' | 'error' | 'restarting' | 'unknown'
export type LinkStatus = 'normal' | 'failed' | 'checking' | 'unknown'
export type ModelControlAction = 'start' | 'stop' | 'restart'

export interface ProcessArea {
  id: string
  name: string
  sortOrder: number
  isAll?: boolean
}

export interface ModelProcess {
  id: string
  processId: string
  processName: string
  modelName: string
  automationName: string
  serverIp: string
  pythonProjectPath: string
  processStatus: ProcessStatus
  monitoringStatus: LinkStatus
  controlStatus: LinkStatus
  lastStatusAt?: string
  description?: string
}

export interface ModelEventLog {
  id: string
  modelProcessId: string
  occurredAt: string
  severity: 'info' | 'warning' | 'error'
  message: string
  detectionSummary?: string
}

export interface ModelSettingsInput {
  serverIp: string
  pythonProjectPath: string
}

export interface ModelCreateInput extends ModelSettingsInput {
  processId: string
  modelName: string
  automationName: string
}
