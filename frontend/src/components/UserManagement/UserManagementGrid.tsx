import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type {
  AccountStatus,
  EmploymentStatus,
  RoleSummary,
  UserAccount,
  UserDangerAction,
  UserGridSaveRequest,
  UserGridRowState,
  UserMutationRequest,
} from '@/types/userManagement'
import { GridColumnFilterRow, type GridColumnFilter } from '@/components/Common'
import { canPerformDangerAction, validateUserMutation, type UserValidationErrors } from '@/services/userManagementValidation'
import { accountStatusLabel, employmentStatusLabel } from './UserStatusBadge'

interface UserManagementGridToolbarOptions {
  add?: boolean
  duplicate?: boolean
  delete?: boolean
  refresh?: boolean
}

interface UserManagementGridProps {
  users: UserAccount[]
  roles: RoleSummary[]
  currentUsername: string
  onBatchAction: (action: UserDangerAction, userIds: number[]) => Promise<void>
  onSaveChanges: (changes: UserGridSaveRequest[]) => Promise<void>
  onRefresh: () => Promise<void>
  onResetPassword?: (userId: number) => Promise<void>
  toolbarOptions?: UserManagementGridToolbarOptions
}

type EditableField = keyof UserMutationRequest
type EditableTextField = 'username' | 'name' | 'displayName' | 'department' | 'position' | 'email' | 'phone'
type UserColumnFilterKey = 'state' | 'id' | 'username' | 'name' | 'displayName' | 'dataEndStatus' | 'createdAt' | 'updatedAt' | 'department' | 'position' | 'email' | 'phone' | 'role' | 'accountStatus' | 'employmentStatus' | 'lastLoginAt'
type SelectableCellField = UserColumnFilterKey

interface SelectedCell {
  rowId: string
  field: SelectableCellField
}

interface UserGridRow extends UserMutationRequest {
  rowId: string
  id?: number
  roles: RoleSummary[]
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
  state: UserGridRowState
  fieldErrors: UserValidationErrors
}

const initialColumnFilters: Record<UserColumnFilterKey, string> = {
  state: '',
  id: '',
  username: '',
  name: '',
  displayName: '',
  dataEndStatus: '',
  createdAt: '',
  updatedAt: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  role: '',
  accountStatus: '',
  employmentStatus: '',
  lastLoginAt: '',
}

const stateLabel: Record<UserGridRowState, string> = {
  clean: '원본',
  new: '신규',
  dirty: '수정',
  discardRequested: '폐기요청',
  invalid: '오류',
  saving: '저장중',
}

const actionLabel: Record<UserDangerAction, string> = {
  lock: '잠금',
  unlock: '잠금 해제',
  disable: '비활성화',
  retire: '퇴사 처리',
  'delete-request': '폐기 요청',
}

const defaultToolbarOptions: Required<UserManagementGridToolbarOptions> = {
  add: true,
  duplicate: true,
  delete: true,
  refresh: true,
}

const headerCellClass = 'h-8 border-b border-r border-[#9dcced] bg-[#dff2ff] px-2 text-center align-middle text-[13px] font-semibold normal-case text-[#266b9f] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-100'
const bodyCellClass = 'h-9 border-b border-r border-[#b7d8ee] p-0 align-middle dark:border-slate-700'
const editableCellClass = 'box-border h-9 w-full rounded-none border border-[#6ab6e8] bg-white px-2 text-sm leading-none text-slate-900 outline-none disabled:border-transparent disabled:bg-[#f4f9fc] disabled:text-slate-500 dark:border-sky-500 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800'
const selectCellClass = 'box-border h-9 w-full rounded-none border border-[#6ab6e8] bg-white px-2 text-sm leading-none text-slate-900 outline-none dark:border-sky-500 dark:bg-slate-900 dark:text-slate-100'
const cellValueClass = 'box-border flex h-9 w-full items-center border border-transparent bg-transparent px-2 text-left text-sm leading-none text-slate-900 outline-none hover:border-[#9dcced] hover:bg-[#eef8ff] focus:border-[#58aee4] focus:bg-[#eef8ff] dark:text-slate-100 dark:hover:border-sky-700 dark:hover:bg-slate-700 dark:focus:border-sky-500 dark:focus:bg-slate-700'
const selectedCellClass = 'border-[#4aa3df] bg-[#cfeaff] shadow-[inset_0_0_0_1px_#4aa3df] dark:border-sky-500 dark:bg-sky-950/60'
const selectableColumns: SelectableCellField[] = ['state', 'id', 'username', 'name', 'displayName', 'dataEndStatus', 'createdAt', 'updatedAt']

let draftSequence = 0

function toGridRow(user: UserAccount): UserGridRow {
  return {
    rowId: String(user.id),
    id: user.id,
    username: user.employeeNo ?? user.username,
    name: user.name,
    displayName: user.remarks ?? user.displayName ?? '',
    department: user.department,
    position: user.position,
    email: user.email,
    phone: user.phone,
    roleIds: user.roleIds,
    roles: user.roles,
    accountStatus: user.dataEndStatus === 'Y' ? 'disabled' : user.accountStatus,
    employmentStatus: user.employmentStatus,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    resetPassword: false,
    state: 'clean',
    fieldErrors: {},
  }
}

function toMutationRequest(row: UserGridRow): UserMutationRequest {
  return {
    username: row.username,
    name: row.name,
    displayName: row.displayName,
    department: row.department,
    position: row.position,
    email: row.email,
    phone: row.phone,
    roleIds: row.roleIds,
    accountStatus: row.accountStatus,
    employmentStatus: row.employmentStatus,
    resetPassword: row.resetPassword,
  }
}

function createDraftRow(roles: RoleSummary[]): UserGridRow {
  draftSequence += 1
  return {
    rowId: `draft-${Date.now()}-${draftSequence}`,
    username: '',
    name: '',
    displayName: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    roleIds: roles[0] ? [roles[0].id] : [],
    roles: roles[0] ? [roles[0]] : [],
    accountStatus: 'active',
    employmentStatus: 'employed',
    resetPassword: false,
    state: 'new',
    fieldErrors: {},
  }
}

function formatDate(value?: string): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function rowClassName(state: UserGridRowState): string {
  if (state === 'new') return 'bg-blue-50 dark:bg-blue-950/20'
  if (state === 'dirty') return 'bg-amber-50 dark:bg-amber-950/20'
  if (state === 'discardRequested') return 'bg-rose-50 dark:bg-rose-950/20'
  if (state === 'invalid') return 'bg-red-50 dark:bg-red-950/20'
  return 'bg-white dark:bg-slate-800'
}

function getColumnFilterValue(row: UserGridRow, key: UserColumnFilterKey): string {
  const values: Record<UserColumnFilterKey, string> = {
    state: stateLabel[row.state],
    id: row.id ? String(row.id) : '',
    username: row.username,
    name: row.name,
    displayName: row.displayName,
    dataEndStatus: row.accountStatus === 'disabled' ? 'Y' : 'N',
    createdAt: formatDate(row.createdAt),
    updatedAt: formatDate(row.updatedAt),
    department: row.department,
    position: row.position,
    email: row.email,
    phone: row.phone,
    role: row.roles.map((role) => role.name).join(', '),
    accountStatus: accountStatusLabel(row.accountStatus),
    employmentStatus: employmentStatusLabel(row.employmentStatus),
    lastLoginAt: formatDate(row.lastLoginAt),
  }

  return values[key]
}

function getCellDisplayValue(row: UserGridRow, field: SelectableCellField): string {
  if (field === 'role') return row.roles.map((role) => role.name).join(', ')
  return getColumnFilterValue(row, field)
}

function roleDisplayValue(roleIds: string[], roles: RoleSummary[]): string {
  const roleMap = new Map(roles.map((role) => [role.id, role.name]))
  return roleIds.map((roleId) => roleMap.get(roleId) ?? roleId).join(', ')
}

export function UserManagementGrid({
  users,
  roles,
  currentUsername,
  onBatchAction,
  onSaveChanges,
  onRefresh,
  onResetPassword,
  toolbarOptions,
}: UserManagementGridProps) {
  const [rows, setRows] = useState<UserGridRow[]>([])
  const [columnFilters, setColumnFilters] = useState<Record<UserColumnFilterKey, string>>(initialColumnFilters)
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [columnFiltersVisible, setColumnFiltersVisible] = useState(false)
  const [nameQuery, setNameQuery] = useState('')
  const [appliedNameQuery, setAppliedNameQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: EditableField; initialValue?: string } | null>(null)
  const [selectedCellRange, setSelectedCellRange] = useState<{ start: SelectedCell; end: SelectedCell } | null>(null)
  const [draggingCellRange, setDraggingCellRange] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState('')
  const footerToolbar = { ...defaultToolbarOptions, ...toolbarOptions }

  useEffect(() => {
    setRows(users.map(toGridRow))
    setSelectedRowIds(new Set())
    setLocalError('')
  }, [users])

  useEffect(() => {
    setCurrentPage(1)
  }, [columnFilters, pageSize])

  useEffect(() => {
    if (!contextMenu) return undefined

    const closeContextMenu = () => setContextMenu(null)
    document.addEventListener('click', closeContextMenu)
    return () => document.removeEventListener('click', closeContextMenu)
  }, [contextMenu])

  useEffect(() => {
    if (!draggingCellRange) return undefined

    const stopDragging = () => setDraggingCellRange(false)
    window.addEventListener('mouseup', stopDragging)
    return () => window.removeEventListener('mouseup', stopDragging)
  }, [draggingCellRange])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (appliedNameQuery.trim() && !row.name.toLowerCase().includes(appliedNameQuery.trim().toLowerCase())) return false
      return (Object.entries(columnFilters) as [UserColumnFilterKey, string][])
        .every(([key, filterValue]) => {
          const value = filterValue.trim().toLowerCase()
          if (!value) return true
          return getColumnFilterValue(row, key).toLowerCase().includes(value)
        })
    })
  }, [appliedNameQuery, columnFilters, rows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * pageSize
  const visibleRows = filteredRows.slice(pageStart, pageStart + pageSize)
  const changedRows = rows.filter((row) => row.state === 'new' || row.state === 'dirty')
  const selectedPersistedRows = rows.filter((row) => selectedRowIds.has(row.rowId) && row.id)
  const selectedRows = rows.filter((row) => selectedRowIds.has(row.rowId))
  const selectedChangedRows = changedRows.filter((row) => selectedRowIds.has(row.rowId))
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedRowIds.has(row.rowId))
  const updateColumnFilter = (key: UserColumnFilterKey, value: string) => {
    setColumnFilters((current) => ({ ...current, [key]: value }))
  }

  const executeSearch = async () => {
    setAppliedNameQuery(nameQuery)
    setCurrentPage(1)
    await onRefresh()
  }

  const columnFilterControls: GridColumnFilter[] = [
    { id: 'select', ariaLabel: '', kind: 'empty', value: '', widthClassName: 'w-12' },
    {
      id: 'state',
      ariaLabel: '상태 필터',
      value: columnFilters.state,
      widthClassName: 'w-28',
      onChange: (value) => updateColumnFilter('state', value),
    },
    {
      id: 'username',
      ariaLabel: '사용자 ID 필터',
      value: columnFilters.username,
      widthClassName: 'w-44',
      onChange: (value) => updateColumnFilter('username', value),
    },
    {
      id: 'name',
      ariaLabel: '이름 필터',
      value: columnFilters.name,
      widthClassName: 'w-36',
      onChange: (value) => updateColumnFilter('name', value),
    },
    {
      id: 'displayName',
      ariaLabel: '표시명 필터',
      value: columnFilters.displayName,
      widthClassName: 'w-40',
      onChange: (value) => updateColumnFilter('displayName', value),
    },
    {
      id: 'department',
      ariaLabel: '부서 필터',
      value: columnFilters.department,
      widthClassName: 'w-44',
      onChange: (value) => updateColumnFilter('department', value),
    },
    {
      id: 'position',
      ariaLabel: '직책 필터',
      value: columnFilters.position,
      widthClassName: 'w-32',
      onChange: (value) => updateColumnFilter('position', value),
    },
    {
      id: 'email',
      ariaLabel: '이메일 필터',
      value: columnFilters.email,
      widthClassName: 'w-64',
      onChange: (value) => updateColumnFilter('email', value),
    },
    {
      id: 'phone',
      ariaLabel: '연락처 필터',
      value: columnFilters.phone,
      widthClassName: 'w-44',
      onChange: (value) => updateColumnFilter('phone', value),
    },
    {
      id: 'role',
      ariaLabel: '역할 필터',
      kind: 'select',
      value: columnFilters.role,
      widthClassName: 'w-40',
      onChange: (value) => updateColumnFilter('role', value),
      options: [
        { value: '', label: '전체' },
        ...roles.map((role) => ({ value: role.name, label: role.name })),
      ],
    },
    {
      id: 'accountStatus',
      ariaLabel: '계정 상태 필터',
      kind: 'select',
      value: columnFilters.accountStatus,
      widthClassName: 'w-32',
      onChange: (value) => updateColumnFilter('accountStatus', value),
      options: [
        { value: '', label: '전체' },
        { value: '활성', label: '활성' },
        { value: '잠금', label: '잠금' },
        { value: '비활성', label: '비활성' },
      ],
    },
    {
      id: 'employmentStatus',
      ariaLabel: '재직 상태 필터',
      kind: 'select',
      value: columnFilters.employmentStatus,
      widthClassName: 'w-32',
      onChange: (value) => updateColumnFilter('employmentStatus', value),
      options: [
        { value: '', label: '전체' },
        { value: '재직', label: '재직' },
        { value: '휴직', label: '휴직' },
        { value: '퇴사', label: '퇴사' },
      ],
    },
    {
      id: 'lastLoginAt',
      ariaLabel: '마지막 접속 필터',
      value: columnFilters.lastLoginAt,
      widthClassName: 'w-44',
      onChange: (value) => updateColumnFilter('lastLoginAt', value),
    },
  ]

  const masterColumnFilterControls: GridColumnFilter[] = [
    { id: 'select', ariaLabel: '', kind: 'empty', value: '', widthClassName: 'w-12' },
    { id: 'username', ariaLabel: '직번 필터', value: columnFilters.username, widthClassName: 'w-44', onChange: (value) => updateColumnFilter('username', value) },
    { id: 'name', ariaLabel: '이름 필터', value: columnFilters.name, widthClassName: 'w-36', onChange: (value) => updateColumnFilter('name', value) },
    { id: 'resetPassword', ariaLabel: '비밀번호 초기화 필터', kind: 'empty', value: '', widthClassName: 'w-32' },
    { id: 'role', ariaLabel: '권한 필터', kind: 'select', value: columnFilters.role, widthClassName: 'w-40', onChange: (value) => updateColumnFilter('role', value), options: [{ value: '', label: '전체' }, ...roles.map((role) => ({ value: role.name, label: role.name }))] },
    { id: 'displayName', ariaLabel: '비고 필터', value: columnFilters.displayName, widthClassName: 'w-64', onChange: (value) => updateColumnFilter('displayName', value) },
  ]

  const updateRow = (rowId: string, field: EditableField, value: UserMutationRequest[EditableField]) => {
    setRows((current) => current.map((row) => {
      if (row.rowId !== rowId) return row
      const nextRoles = field === 'roleIds'
        ? roles.filter((role) => (value as string[]).includes(role.id))
        : row.roles
      const next = { ...row, [field]: value, roles: nextRoles, fieldErrors: { ...row.fieldErrors, [field]: undefined } }
      return { ...next, state: row.state === 'new' ? 'new' : 'dirty' }
    }))
  }

  const addRow = () => {
    const draft = createDraftRow(roles)
    setRows((current) => [draft, ...current])
    setSelectedRowIds(new Set([draft.rowId]))
    setLocalError('')
  }

  const duplicateRows = () => {
    if (!selectedRows.length) {
      setLocalError('복제할 행을 선택하세요.')
      return
    }

    const drafts = selectedRows.map((row) => {
      const draft = createDraftRow(roles)
      return {
        ...draft,
        name: row.name,
        displayName: `${row.displayName} 복사`,
        department: row.department,
        position: row.position,
        phone: row.phone,
        roleIds: [...row.roleIds],
        roles: [...row.roles],
        accountStatus: row.accountStatus,
        employmentStatus: row.employmentStatus,
      }
    })

    setRows((current) => [...drafts, ...current])
    setSelectedRowIds(new Set(drafts.map((row) => row.rowId)))
    setLocalError('')
    setCurrentPage(1)
  }

  const deleteRows = async () => {
    setLocalError('')
    if (!selectedRows.length) {
      setLocalError('삭제할 행을 선택하세요.')
      return
    }

    if (!window.confirm(`${selectedRows.length}건의 사용자를 삭제 요청하시겠습니까?`)) return

    const draftRowIds = new Set(selectedRows.filter((row) => !row.id).map((row) => row.rowId))
    const persistedTargets = selectedRows.filter((row): row is UserGridRow & { id: number } => Boolean(row.id))

    if (draftRowIds.size) {
      setRows((current) => current.filter((row) => !draftRowIds.has(row.rowId)))
      setSelectedRowIds((current) => new Set([...current].filter((rowId) => !draftRowIds.has(rowId))))
    }

    if (persistedTargets.length) {
      await runBatchAction('delete-request', persistedTargets.map((row) => row.rowId), true)
    }
  }

  const saveRows = async () => {
    setLocalError('')
    if (!selectedChangedRows.length) {
      setLocalError('저장할 변경 행을 선택하세요.')
      return
    }

    const changes = selectedChangedRows.map((row) => {
      const input = toMutationRequest(row)
      return { row, input, errors: validateUserMutation(input, users, row.id) }
    })
    const invalidRows = changes.filter(({ errors }) => Object.keys(errors).length > 0)

    if (invalidRows.length) {
      const invalidRowIds = new Set(invalidRows.map(({ row }) => row.rowId))
      setRows((current) => current.map((row) => {
        const invalid = invalidRows.find(({ row: invalidRow }) => invalidRow.rowId === row.rowId)
        return invalidRowIds.has(row.rowId)
          ? { ...row, state: 'invalid', fieldErrors: invalid?.errors ?? {} }
          : row
      }))
      setLocalError('필수값, 역할, 이메일 형식을 확인한 뒤 저장하세요.')
      return
    }

    if (!window.confirm(`${changedRows.length}건의 사용자 변경 사항을 저장하시겠습니까?`)) return

    setRows((current) => current.map((row) => changedRows.some((changed) => changed.rowId === row.rowId) ? { ...row, state: 'saving' } : row))
    setSaving(true)
    try {
      await onSaveChanges(changes.map(({ row, input }) => ({ rowId: row.rowId, userId: row.id, input })))
      setSelectedRowIds(new Set())
    } catch (saveError) {
      setRows((current) => current.map((row) => row.state === 'saving' ? { ...row, state: row.id ? 'dirty' : 'new' } : row))
      setLocalError(saveError instanceof Error ? saveError.message : '사용자 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const toggleRow = (rowId: string) => {
    setSelectedRowIds((current) => {
      const next = new Set(current)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }

  const toggleVisibleRows = () => {
    setSelectedRowIds((current) => {
      const next = new Set(current)
      if (allVisibleSelected) visibleRows.forEach((row) => next.delete(row.rowId))
      else visibleRows.forEach((row) => next.add(row.rowId))
      return next
    })
  }

  const runBatchAction = async (action: UserDangerAction, rowIds = [...selectedRowIds], skipConfirmation = false) => {
    setLocalError('')
    const targetRowIds = new Set(rowIds)
    const targets = rows.filter((row): row is UserGridRow & { id: number } => targetRowIds.has(row.rowId) && Boolean(row.id))
    if (!targets.length) {
      setLocalError('상태를 변경할 저장된 사용자를 선택하세요.')
      return
    }

    const blocked = targets
      .map((row) => ({ row, message: canPerformDangerAction(action, row as unknown as UserAccount, currentUsername, users) }))
      .find((item) => item.message)
    if (blocked?.message) {
      setLocalError(`${blocked.row.displayName || blocked.row.username}: ${blocked.message}`)
      return
    }

    if (!skipConfirmation && !window.confirm(`${targets.length}명의 사용자를 ${actionLabel[action]} 처리할까요?`)) return

    setRows((current) => current.map((row) => targetRowIds.has(row.rowId) ? { ...row, state: 'saving' } : row))
    setSaving(true)
    try {
      await onBatchAction(action, targets.map((row) => row.id))
    } catch {
      setRows((current) => current.map((row) => row.state === 'saving' ? { ...row, state: 'clean' } : row))
    } finally {
      setSaving(false)
    }
  }

  const renderError = (row: UserGridRow, field: keyof UserValidationErrors) => (
    row.fieldErrors[field] ? <span className="mt-1 block text-[11px] text-rose-600">{row.fieldErrors[field]}</span> : null
  )

  const openContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY })
  }

  const openEditorFromKeyboard = (event: KeyboardEvent<HTMLElement>, rowId: string, field: EditableField) => {
    if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault()
      setEditingCell({ rowId, field })
      return
    }

    if (field === 'roleIds' || field === 'accountStatus' || field === 'employmentStatus') return
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return

    event.preventDefault()
    const textField = field as EditableTextField
    updateRow(rowId, textField, event.key)
    setEditingCell({ rowId, field: textField, initialValue: event.key })
  }

  const closeEditorFromKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== 'Escape') return
    event.preventDefault()
    setEditingCell(null)
  }

  const isEditing = (rowId: string, field: EditableField) => (
    editingCell?.rowId === rowId && editingCell.field === field
  )

  const isCellInSelectedRange = (rowId: string, field: SelectableCellField) => {
    if (!selectedCellRange) return false

    const startRowIndex = visibleRows.findIndex((row) => row.rowId === selectedCellRange.start.rowId)
    const endRowIndex = visibleRows.findIndex((row) => row.rowId === selectedCellRange.end.rowId)
    const currentRowIndex = visibleRows.findIndex((row) => row.rowId === rowId)
    const startColumnIndex = selectableColumns.indexOf(selectedCellRange.start.field)
    const endColumnIndex = selectableColumns.indexOf(selectedCellRange.end.field)
    const currentColumnIndex = selectableColumns.indexOf(field)

    if ([startRowIndex, endRowIndex, currentRowIndex, startColumnIndex, endColumnIndex, currentColumnIndex].some((index) => index < 0)) {
      return false
    }

    const minRow = Math.min(startRowIndex, endRowIndex)
    const maxRow = Math.max(startRowIndex, endRowIndex)
    const minColumn = Math.min(startColumnIndex, endColumnIndex)
    const maxColumn = Math.max(startColumnIndex, endColumnIndex)

    return currentRowIndex >= minRow && currentRowIndex <= maxRow && currentColumnIndex >= minColumn && currentColumnIndex <= maxColumn
  }

  const getSelectedRangeBounds = () => {
    if (!selectedCellRange) return null

    const startRowIndex = visibleRows.findIndex((row) => row.rowId === selectedCellRange.start.rowId)
    const endRowIndex = visibleRows.findIndex((row) => row.rowId === selectedCellRange.end.rowId)
    const startColumnIndex = selectableColumns.indexOf(selectedCellRange.start.field)
    const endColumnIndex = selectableColumns.indexOf(selectedCellRange.end.field)

    if ([startRowIndex, endRowIndex, startColumnIndex, endColumnIndex].some((index) => index < 0)) return null

    return {
      minRow: Math.min(startRowIndex, endRowIndex),
      maxRow: Math.max(startRowIndex, endRowIndex),
      minColumn: Math.min(startColumnIndex, endColumnIndex),
      maxColumn: Math.max(startColumnIndex, endColumnIndex),
    }
  }

  const getSelectedRangeText = () => {
    const bounds = getSelectedRangeBounds()
    if (!bounds) return ''

    return visibleRows
      .slice(bounds.minRow, bounds.maxRow + 1)
      .map((row) => selectableColumns
        .slice(bounds.minColumn, bounds.maxColumn + 1)
        .map((field) => getCellDisplayValue(row, field))
        .join('\t'))
      .join('\n')
  }

  const copySelectedCellRange = async () => {
    const selectedText = getSelectedRangeText()
    if (!selectedText) return

    try {
      await navigator.clipboard?.writeText(selectedText)
    } catch {
      setLocalError('선택한 셀을 클립보드에 복사하지 못했습니다.')
    }
  }

  const startCellRangeSelection = (event: MouseEvent<HTMLElement>, rowId: string, field: SelectableCellField) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    setEditingCell(null)
    if (event.shiftKey && selectedCellRange) {
      setSelectedCellRange((current) => current ? { ...current, end: { rowId, field } } : { start: { rowId, field }, end: { rowId, field } })
      setDraggingCellRange(false)
      return
    }

    setSelectedCellRange({ start: { rowId, field }, end: { rowId, field } })
    setDraggingCellRange(true)
  }

  const extendCellRangeSelection = (rowId: string, field: SelectableCellField) => {
    if (!draggingCellRange) return
    setSelectedCellRange((current) => current ? { ...current, end: { rowId, field } } : current)
  }

  const selectableCellProps = (rowId: string, field: SelectableCellField) => ({
    onMouseDown: (event: MouseEvent<HTMLElement>) => startCellRangeSelection(event, rowId, field),
    onMouseEnter: () => extendCellRangeSelection(rowId, field),
  })

  const handleEditableCellKeyDown = (event: KeyboardEvent<HTMLElement>, rowId: string, field: EditableField) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault()
      void copySelectedCellRange()
      return
    }

    openEditorFromKeyboard(event, rowId, field)
  }

  const handleReadOnlyCellKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault()
      void copySelectedCellRange()
      return
    }

    if (event.key === 'Enter' || event.key === 'F2') event.preventDefault()
  }

  const selectedCellStateClass = (rowId: string, field: SelectableCellField) => (
    isCellInSelectedRange(rowId, field) ? selectedCellClass : ''
  )

  const renderTextCell = (row: UserGridRow, field: EditableTextField, label: string, disabled = false) => {
    if (isEditing(row.rowId, field) && !disabled) {
      return (
        <input
          aria-label={label}
          autoFocus
          value={row[field]}
          onFocus={(event) => {
            if (editingCell?.initialValue !== undefined) {
              event.currentTarget.setSelectionRange(editingCell.initialValue.length, editingCell.initialValue.length)
              return
            }

            event.currentTarget.select()
          }}
          onBlur={() => setEditingCell(null)}
          onChange={(event) => updateRow(row.rowId, field, event.target.value)}
          onKeyDown={closeEditorFromKeyboard}
          className={editableCellClass}
        />
      )
    }

    return (
      <button
        type="button"
        aria-label={`${label} 셀`}
        {...selectableCellProps(row.rowId, field)}
        onDoubleClick={() => {
          if (!disabled) setEditingCell({ rowId: row.rowId, field })
        }}
        onKeyDown={(event) => {
          if (!disabled) handleEditableCellKeyDown(event, row.rowId, field)
        }}
        className={`${cellValueClass} ${selectedCellStateClass(row.rowId, field)} ${disabled ? 'cursor-default text-slate-500 dark:text-slate-400' : ''}`}
      >
        {row[field]}
      </button>
    )
  }

  const renderSelectCell = (
    row: UserGridRow,
    field: 'accountStatus' | 'employmentStatus',
    label: string,
    value: string,
    options: { value: string; label: string }[],
  ) => {
    const selectionField: SelectableCellField = field

    if (isEditing(row.rowId, field)) {
      return (
        <select
          aria-label={label}
          autoFocus
          value={value}
          onBlur={() => setEditingCell(null)}
          onChange={(event) => {
            const nextValue = event.target.value
            if (field === 'accountStatus') updateRow(row.rowId, field, nextValue as AccountStatus)
            if (field === 'employmentStatus') updateRow(row.rowId, field, nextValue as EmploymentStatus)
          }}
          onKeyDown={closeEditorFromKeyboard}
          className={selectCellClass}
        >
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )
    }

    return (
      <button
        type="button"
        aria-label={`${label} 셀`}
        {...selectableCellProps(row.rowId, selectionField)}
        onDoubleClick={() => setEditingCell({ rowId: row.rowId, field })}
        onKeyDown={(event) => handleEditableCellKeyDown(event, row.rowId, field)}
        className={`${cellValueClass} ${selectedCellStateClass(row.rowId, selectionField)}`}
      >
        {options.find((option) => option.value === value)?.label ?? ''}
      </button>
    )
  }

  const renderRoleSelectCell = (row: UserGridRow) => {
    const roleText = roleDisplayValue(row.roleIds, roles)

    return (
      <div className="relative h-9">
        <button
          type="button"
          aria-label="권한 셀"
          {...selectableCellProps(row.rowId, 'role')}
          onDoubleClick={() => setEditingCell({ rowId: row.rowId, field: 'roleIds' })}
          onKeyDown={(event) => handleEditableCellKeyDown(event, row.rowId, 'roleIds')}
          className={`${cellValueClass} ${selectedCellStateClass(row.rowId, 'role')}`}
        >
          {roleText}
        </button>
        {isEditing(row.rowId, 'roleIds') && (
        <div
          role="listbox"
          aria-label="권한"
          aria-multiselectable="true"
          tabIndex={0}
          autoFocus
          onKeyDown={closeEditorFromKeyboard}
          className="absolute left-0 top-full z-30 mt-0.5 min-h-20 w-full min-w-40 border border-[#6ab6e8] bg-white py-1 text-sm text-slate-900 shadow-lg outline-none dark:border-sky-500 dark:bg-slate-900 dark:text-slate-100"
        >
          {roles.map((role) => {
            const checked = row.roleIds.includes(role.id)
            return (
              <label
                key={role.id}
                role="option"
                aria-selected={checked}
                className="flex h-7 cursor-pointer items-center gap-2 px-2 hover:bg-[#eef8ff] dark:hover:bg-slate-700"
              >
                <input
                  type="checkbox"
                  aria-label={`${role.name} 권한`}
                  checked={checked}
                  onChange={(event) => {
                    const nextRoleIds = event.target.checked
                      ? [...row.roleIds, role.id]
                      : row.roleIds.filter((roleId) => roleId !== role.id)
                    updateRow(row.rowId, 'roleIds', nextRoleIds)
                  }}
                  className="h-4 w-4"
                />
                <span>{role.name}</span>
              </label>
            )
          })}
        </div>
        )}
      </div>
    )
  }

  const renderReadOnlyCell = (row: UserGridRow, field: SelectableCellField, label: string, value: string) => (
    <button
      type="button"
      aria-label={`${label} 셀`}
      {...selectableCellProps(row.rowId, field)}
      onKeyDown={handleReadOnlyCellKeyDown}
      className={`${cellValueClass} ${field === 'state' ? 'justify-center' : ''} ${selectedCellStateClass(row.rowId, field)}`}
    >
      {field === 'state' ? (
        <span className="inline-flex h-6 min-w-14 items-center justify-center border border-[#9dcced] bg-[#eef8ff] px-2 text-xs text-[#266b9f] dark:border-slate-600 dark:bg-slate-800 dark:text-sky-100">{value}</span>
      ) : value}
    </button>
  )

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); void executeSearch() }}>
          <label htmlFor="user-name-search" className="text-sm font-medium text-slate-700 dark:text-slate-200">이름</label>
          <input id="user-name-search" aria-label="이름 검색" value={nameQuery} onChange={(event) => setNameQuery(event.target.value)} placeholder="이름 입력" className="h-8 w-48 rounded border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        </form>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void executeSearch()} disabled={saving} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">조회</button>
        <button type="button" onClick={() => void saveRows()} disabled={saving || selectedChangedRows.length === 0} className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">저장</button>
        <button type="button" onClick={() => void deleteRows()} disabled={saving || selectedRows.length === 0} className="rounded border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/30">삭제</button>
        </div>
      </div>

      <section className="relative flex min-h-0 flex-1 flex-col border border-[#9dcced] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
      {contextMenu && (
        <div
          role="menu"
          className="fixed z-50 min-w-36 rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setColumnFiltersVisible((visible) => !visible)
              setContextMenu(null)
            }}
            className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {columnFiltersVisible ? '검색/필터 숨기기' : '검색/필터'}
          </button>
        </div>
      )}

      {localError && (
        <div role="alert" className="fixed right-6 top-24 z-50 max-w-sm rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-200">
          {localError}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto" onContextMenu={openContextMenu}>
        <table className="w-full min-w-[980px] table-fixed border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm dark:border-slate-700">
          <thead className="sticky top-0 z-10 text-xs font-semibold uppercase">
            <tr>
              <th className={`w-12 ${headerCellClass}`}><input aria-label="전체 선택" type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleRows} /></th>
              <th className={`w-44 ${headerCellClass}`}>직번</th>
              <th className={`w-36 ${headerCellClass}`}>이름</th>
              <th className={`w-32 ${headerCellClass}`}>비밀번호 초기화</th>
              <th className={`w-40 ${headerCellClass}`}>권한</th>
              <th className={`w-64 ${headerCellClass}`}>REMARKS</th>
            </tr>
            {columnFiltersVisible && <GridColumnFilterRow filters={masterColumnFilterControls} />}
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.rowId} className={`${rowClassName(row.state)} ${selectedRowIds.has(row.rowId) ? 'bg-[#d6edff] dark:bg-sky-950/40' : ''} h-9 text-slate-800 hover:bg-[#eef8ff] dark:text-slate-100 dark:hover:bg-slate-700`}>
                <td className={`${bodyCellClass} text-center`}><input aria-label={`${row.username || row.displayName || '신규 행'} 선택`} type="checkbox" checked={selectedRowIds.has(row.rowId)} onChange={() => toggleRow(row.rowId)} /></td>
                <td className={bodyCellClass}>{renderTextCell(row, 'username', '직번', Boolean(row.id))}{renderError(row, 'username')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'name', '이름')}{renderError(row, 'name')}</td>
                <td className={`${bodyCellClass} text-center`}>
                  <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" disabled={saving || !row.id} onClick={() => {
                    if (!row.id || !onResetPassword || !window.confirm('선택한 사용자의 비밀번호를 초기화하시겠습니까?')) return
                    setSaving(true)
                    void onResetPassword(row.id).finally(() => setSaving(false))
                  }}>
                    초기화
                  </button>
                </td>
                <td className={bodyCellClass}>{renderRoleSelectCell(row)}{renderError(row, 'roleIds')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'displayName', '표시명')}{renderError(row, 'displayName')}</td>
              </tr>
            ))}
            {!visibleRows.length && <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">조회된 사용자가 없습니다.</td></tr>}
          </tbody>
        </table>

        {false && <table className="hidden w-full min-w-[1536px] table-fixed border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm dark:border-slate-700">
          <thead className="sticky top-0 z-10 text-xs font-semibold uppercase">
            <tr>
              <th className={`w-12 ${headerCellClass}`}>
                <input aria-label="표시 행 전체 선택" type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleRows} />
              </th>
              <th className={`w-28 ${headerCellClass}`}>상태</th>
              <th className={`w-44 ${headerCellClass}`}>사용자 ID</th>
              <th className={`w-36 ${headerCellClass}`}>이름</th>
              <th className={`w-40 ${headerCellClass}`}>표시명</th>
              <th className={`w-44 ${headerCellClass}`}>부서</th>
              <th className={`w-32 ${headerCellClass}`}>직책</th>
              <th className={`w-64 ${headerCellClass}`}>이메일</th>
              <th className={`w-44 ${headerCellClass}`}>연락처</th>
              <th className={`w-40 ${headerCellClass}`}>역할</th>
              <th className={`w-32 ${headerCellClass}`}>계정</th>
              <th className={`w-32 ${headerCellClass}`}>재직</th>
              <th className={`w-44 ${headerCellClass}`}>마지막 접속</th>
            </tr>
            {columnFiltersVisible && <GridColumnFilterRow filters={columnFilterControls} />}
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.rowId} className={`${rowClassName(row.state)} ${selectedRowIds.has(row.rowId) ? 'bg-[#d6edff] dark:bg-sky-950/40' : ''} h-9 text-slate-800 hover:bg-[#eef8ff] dark:text-slate-100 dark:hover:bg-slate-700`}>
                <td className={`${bodyCellClass} text-center`}>
                  <input aria-label={`${row.username || row.displayName || '신규 행'} 선택`} type="checkbox" checked={selectedRowIds.has(row.rowId)} onChange={() => toggleRow(row.rowId)} />
                </td>
                <td className={`${bodyCellClass} text-center`}>
                  {renderReadOnlyCell(row, 'state', '상태', stateLabel[row.state])}
                </td>
                <td className={bodyCellClass}>
                  {renderTextCell(row, 'username', '사용자 ID', Boolean(row.id))}
                  {renderError(row, 'username')}
                </td>
                <td className={bodyCellClass}>
                  {renderTextCell(row, 'name', '이름')}
                  {renderError(row, 'name')}
                </td>
                <td className={bodyCellClass}>
                  {renderTextCell(row, 'displayName', '표시명')}
                  {renderError(row, 'displayName')}
                </td>
                <td className={bodyCellClass}>
                  {renderTextCell(row, 'department', '부서')}
                </td>
                <td className={bodyCellClass}>
                  {renderTextCell(row, 'position', '직책')}
                </td>
                <td className={bodyCellClass}>
                  {renderTextCell(row, 'email', '이메일')}
                  {renderError(row, 'email')}
                </td>
                <td className={bodyCellClass}>
                  {renderTextCell(row, 'phone', '연락처')}
                </td>
                <td className={bodyCellClass}>
                  {renderRoleSelectCell(row)}
                  {renderError(row, 'roleIds')}
                </td>
                <td className={bodyCellClass}>
                  {renderSelectCell(
                    row,
                    'accountStatus',
                    '계정 상태',
                    row.accountStatus,
                    [
                      { value: 'active', label: '활성' },
                      { value: 'locked', label: '잠금' },
                      { value: 'disabled', label: '비활성' },
                    ],
                  )}
                </td>
                <td className={bodyCellClass}>
                  {renderSelectCell(
                    row,
                    'employmentStatus',
                    '재직 상태',
                    row.employmentStatus,
                    [
                      { value: 'employed', label: '재직' },
                      { value: 'leave', label: '휴직' },
                      { value: 'retired', label: '퇴사' },
                    ],
                  )}
                </td>
                <td className={`${bodyCellClass} text-xs text-slate-500 dark:text-slate-300`}>
                  {renderReadOnlyCell(row, 'lastLoginAt', '마지막 접속', formatDate(row.lastLoginAt))}
                </td>
              </tr>
            ))}
            {!visibleRows.length && (
              <tr>
                <td colSpan={13} className="p-8 text-center text-sm text-slate-500">조건에 맞는 사용자가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <div className="flex flex-wrap items-center gap-1">
          {footerToolbar.add && <button type="button" onClick={addRow} className="rounded border border-slate-300 px-2 py-1 font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">행 추가</button>}
          {footerToolbar.duplicate && <button type="button" onClick={duplicateRows} disabled={saving || !selectedRows.length} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:opacity-50 dark:border-slate-600">행 복제</button>}
          {footerToolbar.delete && <button type="button" onClick={() => void deleteRows()} disabled={saving || !selectedRows.length} className="rounded border border-rose-300 px-2 py-1 font-medium text-rose-700 disabled:opacity-50 dark:border-rose-700 dark:text-rose-300">행 삭제</button>}
          {footerToolbar.refresh && <button type="button" onClick={() => void onRefresh()} disabled={saving} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:opacity-50 dark:border-slate-600">새로고침</button>}
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <span>선택 {selectedPersistedRows.length}명 / 변경 {changedRows.length}건</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>총 {filteredRows.length}명</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <select aria-label="표시 건수" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-white">
            <option value={10}>10개</option>
            <option value={25}>25개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
          <button type="button" aria-label="이전 페이지" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safeCurrentPage <= 1} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50 dark:border-slate-600">이전</button>
          <span>{safeCurrentPage} / {totalPages}</span>
          <button type="button" aria-label="다음 페이지" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safeCurrentPage >= totalPages} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50 dark:border-slate-600">다음</button>
        </div>
      </div>
      </section>
    </>
  )
}
