import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModelManagementFilters } from '@/components/ModelManagement/ModelManagementFilters'

describe('ModelManagementFilters', () => {
  it('reports status and search changes', () => {
    const onStatusChange = vi.fn()
    const onSearchChange = vi.fn()
    render(<ModelManagementFilters status="all" search="" onStatusChange={onStatusChange} onSearchChange={onSearchChange} />)
    fireEvent.change(screen.getByLabelText('프로세스 상태'), { target: { value: 'error' } })
    fireEvent.change(screen.getByLabelText('검색'), { target: { value: 'VM 01' } })
    expect(onStatusChange).toHaveBeenCalledWith('error')
    expect(onSearchChange).toHaveBeenCalledWith('VM 01')
  })
})
