import { commonCodeService } from './commonCodeService'
import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { ApiResponse } from '@/types/api'
import type { ModelAgent, ModelControlAction, ModelCreateInput, ModelDashboard, ModelEventLog, ModelProcess, ModelSettingsInput, ModelVm, ProcessArea, VmConnectionStatus } from '@/types/modelManagement'

export class ModelManagementError extends Error {
  constructor(public code: 'VALIDATION_ERROR' | 'MODEL_NOT_FOUND' | 'ACTION_BLOCKED', message: string) { super(message) }
}

interface ModelProcessResponse { processes: ModelProcess[]; processAreas: ProcessArea[] }

const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/

function validateSettings(input: ModelSettingsInput) {
  if (!input.serverIp.trim() || !input.pythonProjectPath.trim()) throw new ModelManagementError('VALIDATION_ERROR', '서버 IP와 Python 프로젝트 경로를 입력해 주세요.')
  if (!IPV4_PATTERN.test(input.serverIp.trim())) throw new ModelManagementError('VALIDATION_ERROR', '서버 IP 형식이 올바르지 않습니다.')
}

export async function listProcesses(processAreas?: string[]): Promise<ModelProcessResponse> {
  const params = processAreas?.length ? { processAreas: processAreas.join(',') } : undefined
  const response = await apiClient.get<ModelProcessResponse>('/model-processes', params)
  const data = response.data
  if (response.success === false || !data || !Array.isArray(data.processes)) {
    return { processes: [], processAreas: [{ id: 'all', name: 'ALL', sortOrder: 0, isAll: true }] }
  }
  return {
    processes: data.processes.map((process) => ({
      ...process,
      id: String(process.id),
    })),
    processAreas: Array.isArray(data.processAreas) ? data.processAreas : [],
  }
}

export async function listAgents(): Promise<ModelAgent[]> {
  return getResponseData(await apiClient.get<ModelAgent[]>('/model-processes/agents'), [])
}

export async function listDashboard(processAreas?: string[]): Promise<ModelDashboard> {
  const result = await listProcesses(processAreas)
  const grouped = new Map<string, ModelProcess[]>()
  result.processes.forEach((process) => {
    const key = process.serverIp || 'unknown'
    grouped.set(key, [...(grouped.get(key) ?? []), process])
  })
  const vms: ModelVm[] = [...grouped.entries()].map(([hostAddress, processes]) => ({
    vmId: `vm-${hostAddress.replace(/[^a-zA-Z0-9]/g, '-')}`,
    vmName: processes[0]?.vmName || `AI VM ${hostAddress}`,
    hostAddress,
    connectionStatus: inferVmStatus(processes),
    lastHeartbeatAt: (() => { const values = processes.map((process) => process.lastStatusAt).filter(Boolean).sort(); return values[values.length - 1] })(),
    processes,
  }))
  return { vms, refreshedAt: new Date().toISOString() }
}

function inferVmStatus(processes: ModelProcess[]): VmConnectionStatus {
  if (processes.some((process) => process.monitoringStatus === 'failed')) return 'disconnected'
  if (processes.some((process) => process.monitoringStatus === 'checking')) return 'checking'
  if (processes.some((process) => process.monitoringStatus === 'normal')) return 'connected'
  return 'unknown'
}

export async function createProcessArea(name: string): Promise<ProcessArea> {
  const trimmedName = name.trim()
  if (!trimmedName) throw new ModelManagementError('VALIDATION_ERROR', '공정명을 입력해 주세요.')
  const codes = await commonCodeService.listAdmin()
  const processArea = codes.find((code) => code.name.toUpperCase() === 'PROCESS_AREA')
  if (!processArea) throw new ModelManagementError('MODEL_NOT_FOUND', 'PROCESS_AREA 공통코드를 찾을 수 없습니다.')
  const value = trimmedName.toUpperCase().replace(/\s+/g, '_')
  const detail = await commonCodeService.createDetail(processArea.id, { value, name: trimmedName, nameKo: trimmedName, nameEn: trimmedName, sortOrder: processArea.details.length * 10, description: `${trimmedName} process`, defaultValue: undefined, remarks: undefined })
  return { id: detail.value.toLowerCase(), name: detail.nameKo || detail.name, sortOrder: detail.sortOrder, isAll: false }
}

export async function updateSettings(id: string, input: ModelSettingsInput): Promise<ModelProcess> {
  validateSettings(input)
  return requireProcessData(await apiClient.put<ModelProcess>(`/model-processes/${encodeURIComponent(id)}/settings`, input), 'Updated model process was not returned')
}

export async function deleteProcess(id: string): Promise<void> {
  await apiClient.delete(`/model-processes/${encodeURIComponent(id)}`)
}

export async function controlProcess(id: string, action: ModelControlAction): Promise<ModelProcess> {
  try {
    return requireProcessData(await apiClient.post<ModelProcess>(`/model-processes/${encodeURIComponent(id)}/actions/${action}`), 'Controlled model process was not returned')
  } catch (error) {
    if (error instanceof Error) throw error
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
      throw new Error(error.message)
    }
    throw error
  }
}

export async function listEventLogs(modelProcessId: string): Promise<ModelEventLog[]> {
  // 액션 직후 새 이벤트가 기록되므로 브라우저/프록시가 이전 GET 응답을 재사용하지 않게 한다.
  return getResponseData(await apiClient.get<ModelEventLog[]>(`/model-processes/${encodeURIComponent(modelProcessId)}/event-logs`, { _refresh: Date.now() }), [])
}

export async function createProcess(input: ModelCreateInput): Promise<ModelProcess> {
  if (!input.processId || !input.modelName.trim() || !input.automationName.trim() || !input.agentId.trim()) throw new ModelManagementError('VALIDATION_ERROR', '공정, 모델명, 자동화 기술명, Agent를 선택해 주세요.')
  if (!input.pythonProjectPath.trim()) throw new ModelManagementError('VALIDATION_ERROR', 'Python 프로젝트 경로를 입력해 주세요.')
  return requireProcessData(await apiClient.post<ModelProcess>('/model-processes', input), 'Created model process was not returned')
}

function requireProcessData(response: ApiResponse<ModelProcess>, message: string): ModelProcess {
  const data = getResponseData(response, null)
  if (!data) throw new Error(message)
  return data
}
