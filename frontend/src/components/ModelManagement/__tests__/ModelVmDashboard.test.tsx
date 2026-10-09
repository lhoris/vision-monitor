import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModelVmDashboard } from '@/components/ModelManagement/ModelVmDashboard'
import { modelManagementDashboardFixture } from '../__fixtures__/modelManagementDashboardFixtures'

describe('ModelVmDashboard', () => {
  it('shows VM and nested process status', () => {
    render(<ModelVmDashboard vms={modelManagementDashboardFixture.vms} onSelect={vi.fn()} />)
    expect(screen.getByText('AI VM 01')).toBeInTheDocument()
    expect(screen.getByText('가열 감지 모델')).toBeInTheDocument()
    expect(screen.getByText('연결됨')).toBeInTheDocument()
    expect(screen.getByText('실행 중')).toBeInTheDocument()
  })

  it('renders an explicit empty state', () => {
    render(<ModelVmDashboard vms={[]} onSelect={vi.fn()} />)
    expect(screen.getByText(/조건에 맞는 VM 또는 AI 모델 프로세스가 없습니다/)).toBeInTheDocument()
  })

  it('selects a process cell', async () => {
    const onSelect = vi.fn()
    render(<ModelVmDashboard vms={modelManagementDashboardFixture.vms} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: '가열 감지 모델 프로세스 선택' }))
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(modelManagementDashboardFixture.vms[0].processes[0]))
  })
})
