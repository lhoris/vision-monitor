import { cloneModelProcesses, mockModelEventLogs, mockProcessAreas } from '@/mocks/modelManagement'
import type { ModelControlAction, ModelCreateInput, ModelEventLog, ModelProcess, ModelSettingsInput, ProcessArea } from '@/types/modelManagement'

export class ModelManagementError extends Error {
  constructor(public code: 'VALIDATION_ERROR' | 'MODEL_NOT_FOUND' | 'ACTION_BLOCKED', message: string) {
    super(message)
  }
}

let processes = cloneModelProcesses()
let processAreas = mockProcessAreas.map((item) => ({ ...item }))
const busyIds = new Set<string>()

export function resetModelManagementMock() {
  processes = cloneModelProcesses()
  processAreas = mockProcessAreas.map((item) => ({ ...item }))
  busyIds.clear()
}

export async function listProcesses() {
  return { processes: processes.map((item) => ({ ...item })), processAreas: processAreas.map((item) => ({ ...item })) }
}

export async function createProcessArea(name: string): Promise<ProcessArea> {
  const trimmedName = name.trim()
  if (!trimmedName) throw new ModelManagementError('VALIDATION_ERROR', '공정명을 입력해 주세요.')
  if (processAreas.some((area) => area.name.toLowerCase() === trimmedName.toLowerCase())) throw new ModelManagementError('VALIDATION_ERROR', '이미 등록된 공정명입니다.')
  const area: ProcessArea = { id: `custom-${Date.now()}`, name: trimmedName, sortOrder: processAreas.length, isAll: false }
  processAreas = [...processAreas, area]
  return { ...area }
}

function getProcess(id: string) {
  const item = processes.find((process) => process.id === id)
  if (!item) throw new ModelManagementError('MODEL_NOT_FOUND', '모델 프로세스를 찾을 수 없습니다.')
  return item
}

function validateSettings(input: ModelSettingsInput) {
  if (!input.serverIp.trim() || !input.pythonProjectPath.trim()) throw new ModelManagementError('VALIDATION_ERROR', '서버 IP와 Python 프로젝트 경로를 입력해 주세요.')
  if (!/^((25[0-5]|(2[0-4]|1\d|[1-9]?\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]?\d)))$/.test(input.serverIp.trim())) throw new ModelManagementError('VALIDATION_ERROR', '서버 IP 형식이 올바르지 않습니다.')
}

export async function updateSettings(id: string, input: ModelSettingsInput) {
  validateSettings(input)
  const process = getProcess(id)
  Object.assign(process, { serverIp: input.serverIp.trim(), pythonProjectPath: input.pythonProjectPath.trim() })
  return { ...process }
}

export async function controlProcess(id: string, action: ModelControlAction) {
  const process = getProcess(id)
  if (busyIds.has(id)) throw new ModelManagementError('ACTION_BLOCKED', '처리 중인 모델입니다. 잠시 후 다시 시도해 주세요.')
  busyIds.add(id)
  if (action === 'start') process.processStatus = 'running'
  if (action === 'stop') process.processStatus = 'stopped'
  if (action === 'restart') {
    process.processStatus = 'restarting'
    process.processStatus = 'running'
  }
  process.lastStatusAt = new Date().toISOString()
  busyIds.delete(id)
  return { ...process }
}

export async function listEventLogs(modelProcessId: string): Promise<ModelEventLog[]> {
  getProcess(modelProcessId)
  return mockModelEventLogs.filter((log) => log.modelProcessId === modelProcessId).map((log) => ({ ...log }))
}

export async function createProcess(input: ModelCreateInput) {
  if (!input.processId || !input.modelName.trim() || !input.automationName.trim()) throw new ModelManagementError('VALIDATION_ERROR', '공정, 모델명, 자동화 기술명을 입력해 주세요.')
  validateSettings(input)
  const area = processAreas.find((item) => item.id === input.processId)
  if (!area || area.isAll) throw new ModelManagementError('VALIDATION_ERROR', '개별 공정을 선택해 주세요.')
  const process: ModelProcess = { id: `model-${Date.now()}`, processId: area.id, processName: area.name, modelName: input.modelName.trim(), automationName: input.automationName.trim(), serverIp: input.serverIp.trim(), pythonProjectPath: input.pythonProjectPath.trim(), processStatus: 'unknown', monitoringStatus: 'checking', controlStatus: 'checking', lastStatusAt: new Date().toISOString() }
  processes = [...processes, process]
  return { ...process }
}
