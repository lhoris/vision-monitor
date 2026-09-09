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

  it('renders row action buttons in the custom footer toolbar', () => {
    renderGrid()

    expect(screen.queryByLabelText('사용자 ID 필터')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행 추가' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행 복제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '행 삭제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '새로고침' })).toBeInTheDocument()
    expect(screen.getByText(`총 ${userManagementFixture.length}명`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '변경 취소' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '잠금' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '잠금 해제' })).not.toBeInTheDocument()
  })

  it('runs the main query and save actions from the upper right action bar', async () => {
    const props = renderGrid()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireEvent.click(screen.getByRole('button', { name: '조회' }))
    await waitFor(() => expect(props.onRefresh).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getAllByRole('checkbox')[1])
    fireEvent.doubleClick(screen.getAllByRole('button', { name: '표시명 셀' })[0])
    fireEvent.change(screen.getByLabelText('표시명'), { target: { value: '변경된 표시명' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(props.onSaveChanges).toHaveBeenCalledWith([
      expect.objectContaining({
        userId: userManagementFixture[0].id,
        input: expect.objectContaining({ displayName: '변경된 표시명' }),
      }),
    ]))
    expect(window.confirm).toHaveBeenCalledWith('1건의 사용자 변경 사항을 저장하시겠습니까?')
  })

  it('opens column filter controls from the grid context menu', () => {
    renderGrid()

    fireEvent.contextMenu(screen.getByRole('table'))
    fireEvent.click(screen.getByRole('menuitem', { name: '검색/필터' }))

    expect(screen.getByLabelText('사용자 ID 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('이름 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('역할 필터')).toBeInTheDocument()
  })

  it('filters rows by a column filter', () => {
    renderGrid()

    fireEvent.contextMenu(screen.getByRole('table'))
    fireEvent.click(screen.getByRole('menuitem', { name: '검색/필터' }))
    fireEvent.change(screen.getByLabelText('표시명 필터'), { target: { value: '테스터 운영자' } })

    expect(screen.getByText('총 1명')).toBeInTheDocument()
    expect(screen.getByLabelText('표시명 필터')).toHaveValue('테스터 운영자')
    expect(screen.getByRole('button', { name: '표시명 셀' })).toHaveTextContent('테스터 운영자')
    expect(screen.queryByDisplayValue('테스터 관리자')).not.toBeInTheDocument()
  })

  it('opens a cell editor only after double clicking a cell', () => {
    renderGrid()

    expect(screen.queryByLabelText('표시명')).not.toBeInTheDocument()

    fireEvent.doubleClick(screen.getAllByRole('button', { name: '표시명 셀' })[0])

    expect(screen.getByLabelText('표시명')).toHaveValue('테스터 관리자')
  })

  it('starts editing a selected text cell when typing a character', () => {
    renderGrid()

    const displayNameCell = screen.getAllByRole('button', { name: '표시명 셀' })[0]
    displayNameCell.focus()
    fireEvent.keyDown(displayNameCell, { key: 'A' })

    expect(screen.getByLabelText('표시명')).toHaveValue('A')
  })

  it('selects a cell range with left mouse drag', () => {
    renderGrid()

    const nameCell = screen.getAllByRole('button', { name: '이름 셀' })[0]
    const departmentCell = screen.getAllByRole('button', { name: '부서 셀' })[1]

    fireEvent.mouseDown(nameCell, { button: 0 })
    fireEvent.mouseEnter(departmentCell)
    fireEvent.mouseUp(window)

    expect(nameCell.className).toContain('bg-[#cfeaff]')
    expect(departmentCell.className).toContain('bg-[#cfeaff]')
  })

  it('extends the selected cell range with shift click', () => {
    renderGrid()

    const nameCell = screen.getAllByRole('button', { name: '이름 셀' })[0]
    const departmentCell = screen.getAllByRole('button', { name: '부서 셀' })[1]

    fireEvent.mouseDown(nameCell, { button: 0 })
    fireEvent.mouseUp(window)
    fireEvent.mouseDown(departmentCell, { button: 0, shiftKey: true })

    expect(nameCell.className).toContain('bg-[#cfeaff]')
    expect(departmentCell.className).toContain('bg-[#cfeaff]')
  })

  it('copies the selected cell range as tab separated text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    renderGrid()

    const nameCell = screen.getAllByRole('button', { name: '이름 셀' })[0]
    const departmentCell = screen.getAllByRole('button', { name: '부서 셀' })[1]

    fireEvent.mouseDown(nameCell, { button: 0 })
    fireEvent.mouseEnter(departmentCell)
    fireEvent.mouseUp(window)
    fireEvent.keyDown(nameCell, { key: 'c', ctrlKey: true })

    await waitFor(() => expect(writeText).toHaveBeenCalledWith([
      '관리자 테스트\t테스터 관리자\t통합관제팀',
      '운영 테스트\t테스터 운영자\t생산운영팀',
    ].join('\n')))
  })

  it('hides footer toolbar buttons from options', () => {
    renderGrid({
      toolbarOptions: {
        add: false,
        duplicate: false,
        delete: false,
        refresh: false,
      },
    })

    expect(screen.queryByRole('button', { name: '행 추가' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '행 복제' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '행 삭제' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '새로고침' })).not.toBeInTheDocument()
  })

  it('duplicates selected rows as new draft rows', () => {
    renderGrid()

    fireEvent.click(screen.getByLabelText(/tester1 선택/))
    fireEvent.click(screen.getByRole('button', { name: '행 복제' }))

    expect(screen.getAllByRole('button', { name: '표시명 셀' })[0]).toHaveTextContent('테스터 운영자 복사')
    expect(screen.getAllByText('신규')).toHaveLength(1)
  })

  it('turns persisted row deletion into a delete request batch action', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const props = renderGrid()

    fireEvent.click(screen.getByLabelText(/tester1 선택/))
    fireEvent.click(screen.getByRole('button', { name: '행 삭제' }))

    await waitFor(() => expect(props.onBatchAction).toHaveBeenCalledWith('delete-request', [userManagementFixture[1].id]))
  })
})
