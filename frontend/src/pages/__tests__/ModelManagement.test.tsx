import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ModelManagement from '@/pages/ModelManagement'
import * as modelService from '@/services/modelManagementService'

vi.mock('@/services/modelManagementService', () => ({ listProcesses: vi.fn(), controlProcess: vi.fn(), createProcess: vi.fn(), createProcessArea: vi.fn(), listEventLogs: vi.fn(), updateSettings: vi.fn() }))

const processes = [{ id: 'model-001', processId: 'heating', processName: 'Heating', modelName: 'Heating detector', automationName: 'Heating automation', serverIp: '10.20.4.10', pythonProjectPath: '/opt/heating', processStatus: 'running' as const, monitoringStatus: 'normal' as const, controlStatus: 'normal' as const }]

describe('ModelManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(modelService.listProcesses).mockResolvedValue({ processes, processAreas: [{ id: 'all', name: 'ALL', sortOrder: 0, isAll: true }, { id: 'heating', name: 'Heating', sortOrder: 10 }] })
    vi.mocked(modelService.listEventLogs).mockResolvedValue([])
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('loads rows from the service and supports the ALL process filter', async () => {
    render(<ModelManagement />)
    expect(await screen.findByText('Heating detector')).toBeInTheDocument()
    expect(screen.getByLabelText('ALL')).toBeChecked()
    expect(modelService.listProcesses).toHaveBeenCalledOnce()
  })

  it('opens the event log dialog from the row action menu', async () => {
    render(<ModelManagement />)
    await screen.findByText('Heating detector')
    fireEvent.click(screen.getByRole('button', { name: 'Heating detector 작업 메뉴' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '로그' }))
    await waitFor(() => expect(modelService.listEventLogs).toHaveBeenCalledWith('model-001'))
  })
})
