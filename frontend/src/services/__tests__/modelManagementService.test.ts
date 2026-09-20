import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/services/api'
import { commonCodeService } from '@/services/commonCodeService'
import { controlProcess, createProcess, createProcessArea, listProcesses, updateSettings } from '@/services/modelManagementService'

vi.mock('@/services/api', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))
vi.mock('@/services/commonCodeService', () => ({ commonCodeService: { listAdmin: vi.fn(), createDetail: vi.fn() } }))

const process = { id: 'model-001', processId: 'heating', processName: 'Heating', modelName: 'Heating detector', automationName: 'Heating automation', serverIp: '10.20.4.10', pythonProjectPath: '/opt/heating', processStatus: 'running', monitoringStatus: 'normal', controlStatus: 'normal' }

describe('modelManagementService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads processes and process areas from the model management API', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { processes: [process], processAreas: [{ id: 'all', name: 'ALL', sortOrder: 0, isAll: true }] } })
    const result = await listProcesses()
    expect(apiClient.get).toHaveBeenCalledWith('/model-processes', undefined)
    expect(result.processes).toHaveLength(1)
    expect(result.processAreas[0].isAll).toBe(true)
  })

  it('updates settings and sends process control actions to the API', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { ...process, serverIp: '10.20.4.99' } })
    vi.mocked(apiClient.post).mockResolvedValue({ data: { ...process, processStatus: 'stopped' } })
    await updateSettings('model-001', { serverIp: '10.20.4.99', pythonProjectPath: '/opt/new/model' })
    const updated = await controlProcess('model-001', 'stop')
    expect(apiClient.put).toHaveBeenCalledWith('/model-processes/model-001/settings', { serverIp: '10.20.4.99', pythonProjectPath: '/opt/new/model' })
    expect(apiClient.post).toHaveBeenCalledWith('/model-processes/model-001/actions/stop')
    expect(updated.processStatus).toBe('stopped')
  })

  it('validates settings and creates a process through the API', async () => {
    await expect(updateSettings('model-001', { serverIp: 'bad-ip', pythonProjectPath: '/tmp/model' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    vi.mocked(apiClient.post).mockResolvedValue({ data: { ...process, id: 'model-005', processStatus: 'unknown', monitoringStatus: 'checking' } })
    const created = await createProcess({ processId: 'heating', modelName: 'New model', automationName: 'New automation', serverIp: '10.20.4.30', pythonProjectPath: '/opt/new' })
    expect(apiClient.post).toHaveBeenCalledWith('/model-processes', { processId: 'heating', modelName: 'New model', automationName: 'New automation', serverIp: '10.20.4.30', pythonProjectPath: '/opt/new' })
    expect(created.processStatus).toBe('unknown')
  })

  it('creates a process area in the PROCESS_AREA common code', async () => {
    vi.mocked(commonCodeService.listAdmin).mockResolvedValue([{ id: 'code-process-area', code: 'PROCESS_AREA', name: 'PROCESS_AREA', details: [] }] as never)
    vi.mocked(commonCodeService.createDetail).mockResolvedValue({ value: 'QUALITY', name: 'Quality', nameKo: 'Quality', sortOrder: 0 } as never)
    const created = await createProcessArea('Quality')
    expect(commonCodeService.createDetail).toHaveBeenCalledWith('code-process-area', expect.objectContaining({ value: 'QUALITY', nameKo: 'Quality' }))
    expect(created.id).toBe('quality')
  })
})
