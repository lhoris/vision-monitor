import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userManagementFixture, userManagementRoles } from '@/mocks/userManagement'
import { UserManagementGrid } from '../UserManagementGrid'

function renderGrid(overrides: Partial<ComponentProps<typeof UserManagementGrid>> = {}) {
  const props: ComponentProps<typeof UserManagementGrid> = {
    users: userManagementFixture,
    roles: userManagementRoles,
    currentUsername: 'tester',
    onSaveChanges: vi.fn().mockResolvedValue(undefined),
    onBatchAction: vi.fn().mockResolvedValue(undefined),
    onRefresh: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }

  render(<UserManagementGrid {...props} />)
  return props
}

describe('UserManagementGrid', () => {
  it('adds a new row and shows cell-level validation errors before save', async () => {
    const props = renderGrid()

    fireEvent.click(screen.getByRole('button', { name: '행 추가' }))
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByText('사용자 ID를 입력하세요.')).toBeInTheDocument()
    expect(screen.getByText('이름을 입력하세요.')).toBeInTheDocument()
    expect(props.onSaveChanges).not.toHaveBeenCalled()
  })

  it('saves inline edits as dirty row changes', async () => {
    const props = renderGrid()
    const displayNameInputs = screen.getAllByLabelText('표시명')

    fireEvent.change(displayNameInputs[1], { target: { value: '변경된 운영자' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(props.onSaveChanges).toHaveBeenCalledTimes(1))
    expect(props.onSaveChanges).toHaveBeenCalledWith([
      expect.objectContaining({
        userId: userManagementFixture[1].id,
        input: expect.objectContaining({ displayName: '변경된 운영자' }),
      }),
    ])
  })

  it('blocks self batch actions in the grid before calling the service', () => {
    const props = renderGrid()

    fireEvent.click(screen.getByLabelText(/tester 선택/))
    fireEvent.click(screen.getByRole('button', { name: '비활성화' }))

    expect(screen.getByText(/현재 로그인한 계정에는 이 작업을 수행할 수 없습니다/)).toBeInTheDocument()
    expect(props.onBatchAction).not.toHaveBeenCalled()
  })

  it('runs a confirmed batch action for selected persisted rows', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const props = renderGrid()

    fireEvent.click(screen.getByLabelText(/tester1 선택/))
    fireEvent.click(screen.getByRole('button', { name: '잠금' }))

    await waitFor(() => expect(props.onBatchAction).toHaveBeenCalledWith('lock', [userManagementFixture[1].id]))
  })
})
