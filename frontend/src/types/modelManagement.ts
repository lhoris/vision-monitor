export type ProcessStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'restarting' | 'unknown'
export type LinkStatus = 'normal' | 'failed' | 'checking' | 'unknown'
export type ModelControlAction = 'start' | 'stop' | 'restart'
export type VmConnectionStatus = 'connected' | 'disconnected' | 'checking' | 'unknown'
export type ControlRequestStatus = 'requested' | 'running' | 'succeeded' | 'failed' | 'timeout'

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
  vmName?: string
  enabled?: boolean
  controlRequestStatus?: ControlRequestStatus
}

export interface ModelVm {
  vmId: string
  vmName: string
  hostAddress: string
  connectionStatus: VmConnectionStatus
  lastHeartbeatAt?: string
  processes: ModelProcess[]
}

export interface ModelDashboard {
  refreshedAt?: string
  vms: ModelVm[]
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
