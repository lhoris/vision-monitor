import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userManagementFixture, userManagementRoles } from '@/mocks/userManagement'
import { UserManagementGrid } from '../UserManagementGrid'

function renderGrid(overrides: Partial<ComponentProps<typeof UserManagementGrid>> = {}) {
  const props: ComponentProps<typeof UserManagementGrid> = {
    users: userManagementFixture,
    roles: userManagementRoles,
    currentUsername: 'tester',
    onBatchAction: vi.fn().mockResolvedValue(undefined),
    onSaveChanges: vi.fn().mockResolvedValue(undefined),
    onRefresh: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }

  render(<UserManagementGrid {...props} />)
  return props
}

describe('UserManagementGrid', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the current compact master columns and action bars', () => {
    renderGrid()

    expect(screen.getByText('직번')).toBeInTheDocument()
    expect(screen.getAllByText('이름').length).toBeGreaterThan(0)
    expect(screen.getByText('비밀번호 초기화')).toBeInTheDocument()
    expect(screen.getByText('권한')).toBeInTheDocument()
    expect(screen.getByText('REMARKS')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '조회' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행 추가' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행 복제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행 삭제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '새로고침' })).toBeInTheDocument()
    expect(screen.getByText(`총 ${userManagementFixture.length}명`)).toBeInTheDocument()
  })

  it('runs query and saves edited remarks from the upper action bar', async () => {
    const props = renderGrid()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireEvent.click(screen.getByRole('button', { name: '조회' }))
    await waitFor(() => expect(props.onRefresh).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getAllByRole('checkbox')[1])
    fireEvent.doubleClick(screen.getAllByRole('button', { name: '표시명 셀' })[0])
    fireEvent.change(screen.getByLabelText('표시명'), { target: { value: '변경된 비고' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(props.onSaveChanges).toHaveBeenCalledWith([
      expect.objectContaining({
        userId: userManagementFixture[0].id,
        input: expect.objectContaining({ displayName: '변경된 비고' }),
      }),
    ]))
  })

  it('edits permissions with an overlay checkbox multi-select and saves comma-based roles', async () => {
    const props = renderGrid()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireEvent.click(screen.getAllByRole('checkbox')[1])
    fireEvent.doubleClick(screen.getAllByRole('button', { name: '권한 셀' })[0])
    expect(screen.getByRole('listbox', { name: '권한' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: `${userManagementRoles[1].name} 권한` }))
    fireEvent.keyDown(screen.getByRole('listbox', { name: '권한' }), { key: 'Enter' })

    const roleCell = screen.getAllByRole('button', { name: '권한 셀' })[0]
    expect(roleCell).toHaveTextContent(userManagementRoles[0].name)
    expect(roleCell).toHaveTextContent(userManagementRoles[1].name)

    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(props.onSaveChanges).toHaveBeenCalledWith([
      expect.objectContaining({
        userId: userManagementFixture[0].id,
        input: expect.objectContaining({ roleIds: ['admin', 'operator'] }),
      }),
    ]))
  })

  it('opens compact column filter controls from the context menu', () => {
    renderGrid()

    fireEvent.contextMenu(screen.getByRole('table'))
    fireEvent.click(screen.getByRole('menuitem', { name: '검색/필터' }))

    expect(screen.getByLabelText('직번 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('이름 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('권한 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('비고 필터')).toBeInTheDocument()
  })

  it('filters rows by the remarks column filter', () => {
    renderGrid()

    fireEvent.contextMenu(screen.getByRole('table'))
    fireEvent.click(screen.getByRole('menuitem', { name: '검색/필터' }))
    fireEvent.change(screen.getByLabelText('비고 필터'), {
      target: { value: userManagementFixture[1].displayName },
    })

    expect(screen.getByText('총 1명')).toBeInTheDocument()
    expect(screen.getByLabelText('비고 필터')).toHaveValue(userManagementFixture[1].displayName)
    expect(screen.getByRole('button', { name: '표시명 셀' })).toHaveTextContent(userManagementFixture[1].displayName)
    expect(screen.queryByText(userManagementFixture[0].displayName)).not.toBeInTheDocument()
  })

  it('opens a text cell editor only after double clicking', () => {
    renderGrid()

    expect(screen.queryByLabelText('표시명')).not.toBeInTheDocument()

    fireEvent.doubleClick(screen.getAllByRole('button', { name: '표시명 셀' })[0])

    expect(screen.getByLabelText('표시명')).toHaveValue(userManagementFixture[0].displayName)
  })

  it('starts editing a selected text cell when typing a character', () => {
    renderGrid()

    const nameCell = screen.getAllByRole('button', { name: '이름 셀' })[0]
    nameCell.focus()
    fireEvent.keyDown(nameCell, { key: 'A' })

    expect(screen.getAllByLabelText('이름').find((input) => input.getAttribute('value') === 'A')).toBeInTheDocument()
  })

  it('selects a compact cell range with left mouse drag', () => {
    renderGrid()

    const nameCell = screen.getAllByRole('button', { name: '이름 셀' })[0]
    const remarksCell = screen.getAllByRole('button', { name: '표시명 셀' })[1]

    fireEvent.mouseDown(nameCell, { button: 0 })
    fireEvent.mouseEnter(remarksCell)
    fireEvent.mouseUp(window)

    expect(nameCell.className).toContain('bg-[#cfeaff]')
    expect(remarksCell.className).toContain('bg-[#cfeaff]')
  })

  it('copies the selected compact cell range as tab separated text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    renderGrid()

    const nameCell = screen.getAllByRole('button', { name: '이름 셀' })[0]
    const remarksCell = screen.getAllByRole('button', { name: '표시명 셀' })[1]

    fireEvent.mouseDown(nameCell, { button: 0 })
    fireEvent.mouseEnter(remarksCell)
    fireEvent.mouseUp(window)
    fireEvent.keyDown(nameCell, { key: 'c', ctrlKey: true })

    await waitFor(() => expect(writeText).toHaveBeenCalledWith([
      [userManagementFixture[0].name, userManagementFixture[0].displayName].join('\t'),
      [userManagementFixture[1].name, userManagementFixture[1].displayName].join('\t'),
    ].join('\n')))
  })

  it('duplicates selected rows as editable draft rows', () => {
    renderGrid()

    fireEvent.click(screen.getByLabelText(/tester1 선택/))
    fireEvent.click(screen.getByRole('button', { name: '행 복제' }))

    expect(screen.getAllByRole('button', { name: '표시명 셀' })[0]).toHaveTextContent(`${userManagementFixture[1].displayName} 복사`)
  })

  it('turns persisted row deletion into a delete request batch action', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const props = renderGrid()

    fireEvent.click(screen.getByLabelText(/tester1 선택/))
    fireEvent.click(screen.getByRole('button', { name: '행 삭제' }))

    await waitFor(() => expect(props.onBatchAction).toHaveBeenCalledWith('delete-request', [userManagementFixture[1].id]))
  })
})
