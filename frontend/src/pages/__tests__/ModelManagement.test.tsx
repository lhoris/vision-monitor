import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ModelManagement from '@/pages/ModelManagement'
import { resetModelManagementMock } from '@/services/modelManagementService'

describe('ModelManagement', () => {
  beforeEach(() => {
    resetModelManagementMock()
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('loads all process rows and applies multi-select filtering', async () => {
    render(<ModelManagement />)
    expect(await screen.findByText('가열로 스키드 감시')).toBeInTheDocument()
    expect(screen.getByText('압연 설비 이상감지')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('압연'))
    await waitFor(() => expect(screen.queryByText('가열로 스키드 감시')).not.toBeInTheDocument())
    expect(screen.getByText('압연 설비 이상감지')).toBeInTheDocument()
  })

  it('keeps the all-process filter when an individual process is clicked', async () => {
    render(<ModelManagement />)
    await screen.findByText('가열로 스키드 감시')
    fireEvent.click(screen.getByLabelText('ALL'))
    expect(screen.getByLabelText('ALL')).toBeChecked()
    expect(screen.getByText('선재 표면 결함감지')).toBeInTheDocument()
  })

  it('opens event logs and settings from the grid', async () => {
    render(<ModelManagement />)
    await screen.findByText('가열로 스키드 감시')
    fireEvent.click(screen.getAllByRole('button', { name: /작업 메뉴/ })[0])
    fireEvent.click(screen.getAllByRole('menuitem', { name: '로그' })[0])
    expect(await screen.findByText('Python 프로세스 heartbeat 수신')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))
  })

  it('adds a process area when Enter is pressed in the add dialog', async () => {
    render(<ModelManagement />)
    await screen.findByText('가열로 스키드 감시')
    fireEvent.click(screen.getByRole('button', { name: '+ 공정 추가' }))
    fireEvent.change(screen.getByPlaceholderText('예: 품질'), { target: { value: '품질' } })
    fireEvent.submit(screen.getByRole('button', { name: '추가' }).closest('form') as HTMLFormElement)
    expect(await screen.findByLabelText('품질')).toBeInTheDocument()
  })
})
