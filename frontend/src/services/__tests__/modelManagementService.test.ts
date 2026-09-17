import { beforeEach, describe, expect, it } from 'vitest'
import { controlProcess, createProcess, createProcessArea, listProcesses, resetModelManagementMock, updateSettings } from '@/services/modelManagementService'

describe('modelManagementService', () => {
  beforeEach(() => resetModelManagementMock())

  it('returns all processes and filters support process areas', async () => {
    const result = await listProcesses()
    expect(result.processes).toHaveLength(4)
    expect(result.processAreas.find((area) => area.id === 'all')?.isAll).toBe(true)
  })

  it('updates settings and controls a process in mock state', async () => {
    await updateSettings('model-001', { serverIp: '10.20.4.99', pythonProjectPath: '/opt/new/model' })
    const updated = await controlProcess('model-001', 'stop')
    expect(updated.serverIp).toBe('10.20.4.99')
    expect(updated.processStatus).toBe('stopped')
  })

  it('validates settings and creates a checking process', async () => {
    await expect(updateSettings('model-001', { serverIp: 'bad-ip', pythonProjectPath: '/tmp/model' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    const created = await createProcess({ processId: 'heating', modelName: '신규 모델', automationName: '신규 감지', serverIp: '10.20.4.30', pythonProjectPath: '/opt/new' })
    expect(created.processStatus).toBe('unknown')
    expect(created.monitoringStatus).toBe('checking')
  })

  it('adds a selectable custom process area', async () => {
    const created = await createProcessArea('품질')
    const result = await listProcesses()
    expect(created.name).toBe('품질')
    expect(result.processAreas.some((area) => area.id === created.id)).toBe(true)
  })
})
