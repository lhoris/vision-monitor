import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ success: true, data: { items: [], total: 0, roles: [] } }),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

import { UserManagement } from '../UserManagement'

describe('UserManagement page', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('authUsername', 'tester')
  })

  it('shows the full-width grid workflow without the always-visible detail panel', async () => {
    render(<UserManagement />)

    await waitFor(() => expect(screen.getByRole('button', { name: '행 추가' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
    expect(screen.queryByText(/계정 상태 관리/)).not.toBeInTheDocument()
  })
})
