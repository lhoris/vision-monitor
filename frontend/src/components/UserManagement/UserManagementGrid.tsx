import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
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
import { ConfirmDialog, DataGridActionButton, DataGridTable, DataGridToolbar, GridColumnFilterRow, type GridColumnFilter } from '@/components/Common'
import { useDataGridSelection } from '@/hooks/useDataGridSelection'
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
  onClearNotice?: () => void
  onResetPassword?: (userId: number) => Promise<void>
  onApprove?: (userId: number) => Promise<void>
  onReject?: (userId: number, reason: string) => Promise<void>
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
  accountStatusReason?: string
  passwordResetRequired?: boolean
}

type ConfirmationRequest = {
  title: string
  message: string
  variant?: 'default' | 'danger'
  resolve: (confirmed: boolean) => void
}

type ApprovalRequest = { type: 'approve' | 'reject'; userId: number }

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
const cellValueClass = 'grid-cell-value box-border flex h-9 w-full items-center border border-transparent bg-transparent px-2 text-left text-sm leading-none text-slate-900 outline-none hover:border-[#9dcced] hover:bg-[#eef8ff] focus:border-[#58aee4] focus:bg-[#eef8ff] dark:text-slate-100 dark:hover:border-sky-700 dark:hover:bg-slate-700 dark:focus:border-sky-500 dark:focus:bg-slate-700'
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
    accountStatus: user.accountStatus,
    accountStatusReason: user.accountStatusReason,
    passwordResetRequired: user.passwordResetRequired,
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
  onClearNotice,
  onResetPassword,
  onApprove,
  onReject,
  toolbarOptions,
}: UserManagementGridProps) {
  const { t } = useTranslation()
  const [rows, setRows] = useState<UserGridRow[]>([])
  const [columnFilters, setColumnFilters] = useState<Record<UserColumnFilterKey, string>>(initialColumnFilters)
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [columnFiltersVisible, setColumnFiltersVisible] = useState(false)
  const [loginAccountQuery, setLoginAccountQuery] = useState('')
  const [nameQuery, setNameQuery] = useState('')
  const [appliedLoginAccountQuery, setAppliedLoginAccountQuery] = useState('')
  const [appliedNameQuery, setAppliedNameQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: EditableField; initialValue?: string } | null>(null)
  const [selectedCellRange, setSelectedCellRange] = useState<{ start: SelectedCell; end: SelectedCell } | null>(null)
  const [draggingCellRange, setDraggingCellRange] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState('')
  const [localNotice, setLocalNotice] = useState('')
  const [approvalSaving, setApprovalSaving] = useState(false)
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalValidationError, setApprovalValidationError] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationRequest | null>(null)
  const footerToolbar = { ...defaultToolbarOptions, ...toolbarOptions }

  const askConfirmation = (request: Omit<ConfirmationRequest, 'resolve'>) => new Promise<boolean>((resolve) => {
    setConfirmation({ ...request, resolve })
  })

  useEffect(() => {
    setRows(users.map(toGridRow))
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
      if (appliedLoginAccountQuery.trim() && !row.username.toLowerCase().includes(appliedLoginAccountQuery.trim().toLowerCase())) return false
      if (appliedNameQuery.trim() && !row.name.toLowerCase().includes(appliedNameQuery.trim().toLowerCase())) return false
      return (Object.entries(columnFilters) as [UserColumnFilterKey, string][])
        .every(([key, filterValue]) => {
          const value = filterValue.trim().toLowerCase()
          if (!value) return true
          return getColumnFilterValue(row, key).toLowerCase().includes(value)
        })
    })
  }, [appliedLoginAccountQuery, appliedNameQuery, columnFilters, rows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * pageSize
  const visibleRows = filteredRows.slice(pageStart, pageStart + pageSize)
  const { selectedIds: selectedRowIds, allVisibleSelected, toggle: toggleRow, select: selectRow, selectMany: selectManyRows, toggleVisible, clear: clearSelection } = useDataGridSelection(visibleRows.map((row) => row.rowId))
  useEffect(() => {
    clearSelection()
  }, [users, clearSelection])
  const changedRows = rows.filter((row) => row.state === 'new' || row.state === 'dirty')
  const selectedPersistedRows = rows.filter((row) => selectedRowIds.has(row.rowId) && row.id)
  const selectedRows = rows.filter((row) => selectedRowIds.has(row.rowId))
  const selectedDraftRows = selectedRows.filter((row) => !row.id)
  const selectedChangedRows = changedRows.filter((row) => selectedRowIds.has(row.rowId))
  const updateColumnFilter = (key: UserColumnFilterKey, value: string) => {
    setColumnFilters((current) => ({ ...current, [key]: value }))
  }

  const executeSearch = async () => {
    onClearNotice?.()
    setAppliedLoginAccountQuery(loginAccountQuery)
    setAppliedNameQuery(nameQuery)
    setCurrentPage(1)
    await onRefresh()
    setLocalNotice(t('userManagement.searchCompleted'))
  }

  const executeRefresh = async () => {
    onClearNotice?.()
    await onRefresh()
    setLocalNotice(t('userManagement.refreshCompleted'))
  }

  useEffect(() => {
    if (!localNotice) return undefined
    const timeoutId = window.setTimeout(() => setLocalNotice(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [localNotice])

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
    { id: 'select', ariaLabel: '', kind: 'empty', value: '', widthClassName: 'w-8' },
    { id: 'username', ariaLabel: `${t('userManagement.loginAccount')} 필터`, value: columnFilters.username, widthClassName: 'w-[200px]', onChange: (value) => updateColumnFilter('username', value) },
    { id: 'name', ariaLabel: `${t('userManagement.name')} 필터`, value: columnFilters.name, widthClassName: 'w-[200px]', onChange: (value) => updateColumnFilter('name', value) },
    { id: 'email', ariaLabel: `${t('userManagement.email')} 필터`, value: columnFilters.email, widthClassName: 'w-[190px]', onChange: (value) => updateColumnFilter('email', value) },
    { id: 'phone', ariaLabel: `${t('userManagement.phone')} 필터`, value: columnFilters.phone, widthClassName: 'w-[140px]', onChange: (value) => updateColumnFilter('phone', value) },
    { id: 'department', ariaLabel: `${t('userManagement.department')} 필터`, value: columnFilters.department, widthClassName: 'w-[150px]', onChange: (value) => updateColumnFilter('department', value) },
    { id: 'position', ariaLabel: `${t('userManagement.position')} 필터`, value: columnFilters.position, widthClassName: 'w-[130px]', onChange: (value) => updateColumnFilter('position', value) },
    { id: 'resetPassword', ariaLabel: `${t('userManagement.password')} 필터`, kind: 'empty', value: '', widthClassName: 'w-[90px]' },
    { id: 'accountStatus', ariaLabel: `${t('userManagement.accountStatus')} 필터`, kind: 'empty', value: '', widthClassName: 'w-[140px]' },
    { id: 'role', ariaLabel: `${t('userManagement.role')} 필터`, kind: 'select', value: columnFilters.role, widthClassName: 'w-[240px]', onChange: (value) => updateColumnFilter('role', value), options: [{ value: '', label: '전체' }, ...roles.map((role) => ({ value: role.name, label: role.name }))] },
    { id: 'displayName', ariaLabel: `${t('userManagement.remarks')} 필터`, value: columnFilters.displayName, widthClassName: 'w-auto', onChange: (value) => updateColumnFilter('displayName', value) },
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
    selectRow(rowId)
  }

  const addRow = () => {
    const draft = createDraftRow(roles)
    setRows((current) => [draft, ...current])
    selectManyRows([draft.rowId])
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
    selectManyRows(drafts.map((row) => row.rowId))
    setLocalError('')
    setCurrentPage(1)
  }

  const deleteDraftRows = async () => {
    setLocalNotice('')
    setLocalError('')
    if (!selectedDraftRows.length) {
      setLocalError('신규 행만 행 삭제할 수 있습니다.')
      return
    }

    if (!await askConfirmation({ title: t('userManagement.deleteDraftTitle'), message: t('userManagement.deleteDraftMessage', { count: selectedDraftRows.length }), variant: 'danger' })) return

    const draftRowIds = new Set(selectedDraftRows.map((row) => row.rowId))
    setRows((current) => current.filter((row) => !draftRowIds.has(row.rowId)))
    selectManyRows([...selectedRowIds].filter((rowId) => !draftRowIds.has(rowId)))
    setLocalNotice(t('userManagement.draftDeleteSuccess', { count: selectedDraftRows.length }))
  }

  const deleteRows = async () => {
    setLocalNotice('')
    setLocalError('')
    const persistedTargets = selectedRows.filter((row): row is UserGridRow & { id: number } => Boolean(row.id))
    if (!persistedTargets.length) {
      setLocalError('기존 사용자를 선택한 뒤 삭제 버튼을 사용하세요.')
      return
    }

    const deleteMessageKey = persistedTargets.length === 1 ? 'userManagement.deleteUserMessageSingle' : 'userManagement.deleteUserMessage'
    if (!await askConfirmation({
      title: t('userManagement.deleteUserTitle'),
      message: t(deleteMessageKey, {
        count: persistedTargets.length,
        username: persistedTargets[0]?.username || '-',
        name: persistedTargets[0]?.name || '-',
      }),
      variant: 'danger',
    })) return

    await runBatchAction('delete-request', persistedTargets.map((row) => row.rowId), true)
  }

  const saveRows = async () => {
    setLocalNotice('')
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

    const saveMessage = selectedChangedRows.length === 1
      ? t('userManagement.saveMessageSingle', {
        username: selectedChangedRows[0]?.username || '-',
        name: selectedChangedRows[0]?.name || '-',
      })
      : t('userManagement.saveMessage', { count: selectedChangedRows.length })
    if (!await askConfirmation({ title: t('userManagement.saveTitle'), message: saveMessage })) return

    setRows((current) => current.map((row) => changedRows.some((changed) => changed.rowId === row.rowId) ? { ...row, state: 'saving' } : row))
    setSaving(true)
    try {
      await onSaveChanges(changes.map(({ row, input }) => ({ rowId: row.rowId, userId: row.id, input })))
      clearSelection()
    } catch (saveError) {
      setRows((current) => current.map((row) => row.state === 'saving' ? { ...row, state: row.id ? 'dirty' : 'new' } : row))
      setLocalError(saveError instanceof Error ? saveError.message : '사용자 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
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

    if (!skipConfirmation && !await askConfirmation({ title: '사용자 상태 변경 확인', message: `선택한 ${targets.length}명의 사용자를 ${actionLabel[action]} 처리할까요?`, variant: action === 'delete-request' ? 'danger' : 'default' })) return

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

    if (field === 'accountStatus' && value === 'pending' && row.id && onApprove && onReject) {
      return (
        <div className="flex h-9 items-center justify-start gap-1 whitespace-nowrap px-2">
          <button type="button" onClick={() => setApprovalRequest({ type: 'approve', userId: row.id! })} disabled={approvalSaving} className="rounded border border-emerald-300 px-1.5 py-0.5 text-xs font-medium text-emerald-700 disabled:opacity-50">{t('userManagement.approve')}</button>
          <button type="button" onClick={() => { setRejectionReason(''); setApprovalValidationError(''); setApprovalRequest({ type: 'reject', userId: row.id! }) }} disabled={approvalSaving} className="rounded border border-rose-300 px-1.5 py-0.5 text-xs font-medium text-rose-700 disabled:opacity-50">{t('userManagement.reject')}</button>
        </div>
      )
    }

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
          onMouseDown={(event) => {
            event.preventDefault()
            setEditingCell({ rowId: row.rowId, field: 'roleIds' })
          }}
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

  const submitApprovalRequest = async () => {
    if (!approvalRequest) return
    const reason = rejectionReason.trim()
    if (approvalRequest.type === 'reject' && !reason) {
      setApprovalValidationError(t('userManagement.rejectionReasonRequired'))
      return
    }

    setApprovalSaving(true)
    setApprovalValidationError('')
    setLocalError('')
    try {
      if (approvalRequest.type === 'approve') await onApprove?.(approvalRequest.userId)
      else await onReject?.(approvalRequest.userId, reason)
      setApprovalRequest(null)
      setRejectionReason('')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : t('userManagement.statusChangeError'))
    } finally {
      setApprovalSaving(false)
    }
  }

  return (
    <>
      <DataGridToolbar className="mb-2" data-onboarding="user-management-actions">
        <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); void executeSearch() }}>
          <label htmlFor="user-login-account-search" className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('userManagement.loginAccount')}</label>
          <input id="user-login-account-search" aria-label={t('userManagement.loginAccountSearch')} value={loginAccountQuery} onChange={(event) => setLoginAccountQuery(event.target.value)} placeholder={t('userManagement.loginAccountSearch')} className="h-8 w-48 rounded border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
          <label htmlFor="user-name-search" className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('userManagement.name')}</label>
          <input id="user-name-search" aria-label={t('userManagement.nameSearch')} value={nameQuery} onChange={(event) => setNameQuery(event.target.value)} placeholder={t('userManagement.nameSearch')} className="h-8 w-48 rounded border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        </form>
        <div className="flex items-center gap-2">
          <DataGridActionButton type="button" onClick={() => void executeSearch()} disabled={saving}>{t('userManagement.search')}</DataGridActionButton>
        <DataGridActionButton type="button" variant="primary" onClick={() => void saveRows()} disabled={saving || selectedChangedRows.length === 0}>{t('userManagement.save')}</DataGridActionButton>
        <DataGridActionButton type="button" variant="danger" onClick={() => void deleteRows()} disabled={saving || selectedRows.every((row) => !row.id)}>{t('userManagement.delete')}</DataGridActionButton>
        </div>
      </DataGridToolbar>

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
            {columnFiltersVisible ? t('userManagement.hideFilters') : t('userManagement.showFilters')}
          </button>
        </div>
      )}

      {localError && (
        <div role="alert" className="fixed right-6 top-24 z-50 max-w-sm rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-200">
          {localError}
        </div>
      )}

      {localNotice && (
        <div role="status" className="animate-toast-in-out fixed right-6 top-20 z-50 max-w-sm rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200">
          {localNotice}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto" onContextMenu={openContextMenu}>
        <DataGridTable className="w-full min-w-[980px] border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm dark:border-slate-700" data-onboarding="user-management-grid">
          <thead className="sticky top-0 z-10 text-xs font-semibold uppercase">
            <tr>
              <th className={`w-8 ${headerCellClass}`}><input aria-label={t('userManagement.selectAll')} type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} /></th>
              <th className={`w-[200px] ${headerCellClass}`}>{t('userManagement.loginAccount')}</th>
              <th className={`w-[200px] ${headerCellClass}`}>{t('userManagement.name')}</th>
              <th className={`w-[190px] ${headerCellClass}`}>{t('userManagement.email')}</th>
              <th className={`w-[140px] ${headerCellClass}`}>{t('userManagement.phone')}</th>
              <th className={`w-[150px] ${headerCellClass}`}>{t('userManagement.department')}</th>
              <th className={`w-[130px] ${headerCellClass}`}>{t('userManagement.position')}</th>
              <th className={`w-[90px] ${headerCellClass}`}>{t('userManagement.password')}</th>
              <th className={`w-[140px] ${headerCellClass}`}>{t('userManagement.accountStatus')}</th>
              <th className={`w-[240px] ${headerCellClass}`}>{t('userManagement.role')}</th>
              <th className={`w-auto ${headerCellClass}`}>{t('userManagement.remarks')}</th>
            </tr>
            {columnFiltersVisible && <GridColumnFilterRow filters={masterColumnFilterControls} />}
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.rowId} className={`${rowClassName(row.state)} ${selectedRowIds.has(row.rowId) ? 'bg-[#d6edff] dark:bg-sky-950/40' : ''} h-9 text-slate-800 hover:bg-[#eef8ff] dark:text-slate-100 dark:hover:bg-slate-700`}>
                <td className={`${bodyCellClass} text-center`}><input aria-label={`${row.username || row.displayName || '신규 행'} 선택`} type="checkbox" checked={selectedRowIds.has(row.rowId)} onChange={() => toggleRow(row.rowId)} /></td>
                <td className={bodyCellClass}>{renderTextCell(row, 'username', t('userManagement.loginAccount'), Boolean(row.id))}{renderError(row, 'username')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'name', t('userManagement.name'))}{renderError(row, 'name')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'email', t('userManagement.email'))}{renderError(row, 'email')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'phone', t('userManagement.phone'))}{renderError(row, 'phone')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'department', t('userManagement.department'))}{renderError(row, 'department')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'position', t('userManagement.position'))}{renderError(row, 'position')}</td>
                <td className={`${bodyCellClass} text-center`}>
                  <button type="button" title={row.username?.toLowerCase() === currentUsername.toLowerCase() ? t('userManagement.resetPasswordSelfDisabled') : undefined} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700" disabled={saving || !row.id || Boolean(row.passwordResetRequired) || row.username?.toLowerCase() === currentUsername.toLowerCase()} onClick={() => {
                    if (!row.id || !onResetPassword) return
                    void askConfirmation({
                      title: t('userManagement.resetPasswordTitle'),
                      message: t('userManagement.resetPasswordMessage', {
                        username: row.username || '-',
                        name: row.name || '-',
                      }),
                      variant: 'danger',
                    }).then((confirmed) => {
                      if (!confirmed || !row.id || !onResetPassword) return
                      setSaving(true)
                      void onResetPassword(row.id)
                        .catch((resetError) => {
                          setLocalError(resetError instanceof Error ? resetError.message : t('userManagement.passwordResetError'))
                        })
                        .finally(() => setSaving(false))
                    })
                    return
                  }}>
                    {row.passwordResetRequired ? t('userManagement.passwordResetDone') : t('userManagement.resetAction')}
                  </button>
                </td>
                <td className={bodyCellClass} data-onboarding={row.accountStatus === 'pending' ? 'user-management-approval' : undefined} title={row.accountStatus === 'rejected' && row.accountStatusReason ? t('userManagement.rejectionReasonTooltip', { reason: row.accountStatusReason }) : undefined}>{renderSelectCell(row, 'accountStatus', t('userManagement.accountStatus'), row.accountStatus, [
                  { value: 'active', label: t('userManagement.accountStatuses.active') },
                  { value: 'pending', label: t('userManagement.accountStatuses.pending') },
                  { value: 'inactive', label: t('userManagement.accountStatuses.inactive') },
                  { value: 'locked', label: t('userManagement.accountStatuses.locked') },
                  { value: 'rejected', label: t('userManagement.accountStatuses.rejected') },
                  { value: 'disabled', label: t('userManagement.accountStatuses.disabled') },
                ])}</td>
                <td className={bodyCellClass} data-onboarding="user-management-role">{renderRoleSelectCell(row)}{renderError(row, 'roleIds')}</td>
                <td className={bodyCellClass}>{renderTextCell(row, 'displayName', t('userManagement.remarks'))}{renderError(row, 'displayName')}</td>
              </tr>
            ))}
            {!visibleRows.length && <tr><td colSpan={11} className="p-8 text-center text-sm text-slate-500">조회된 사용자가 없습니다.</td></tr>}
          </tbody>
        </DataGridTable>

        {false && <table className="hidden w-full min-w-[1536px] table-fixed border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm dark:border-slate-700">
          <thead className="sticky top-0 z-10 text-xs font-semibold uppercase">
            <tr>
              <th className={`w-12 ${headerCellClass}`}>
                <input aria-label="표시 행 전체 선택" type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} />
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
          {footerToolbar.add && <button type="button" onClick={addRow} className="rounded border border-slate-300 px-2 py-1 font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">{t('userManagement.add')}</button>}
          {footerToolbar.duplicate && <button type="button" onClick={duplicateRows} disabled={saving || !selectedRows.length} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:opacity-50 dark:border-slate-600">{t('userManagement.duplicate')}</button>}
          {footerToolbar.delete && <button type="button" onClick={() => void deleteDraftRows()} disabled={saving || !selectedDraftRows.length} className="rounded border border-rose-300 px-2 py-1 font-medium text-rose-700 disabled:opacity-50 dark:border-rose-700 dark:text-rose-300">{t('userManagement.deleteRow')}</button>}
          {footerToolbar.refresh && <button type="button" onClick={() => void executeRefresh()} disabled={saving} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:opacity-50 dark:border-slate-600">{t('userManagement.refresh')}</button>}
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <span>{t('userManagement.selectedSummary', { selected: selectedPersistedRows.length, changed: changedRows.length })}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{t('userManagement.totalSummary', { count: filteredRows.length })}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <select aria-label={t('userManagement.pageSize')} value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-white">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button type="button" aria-label={t('userManagement.previous')} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safeCurrentPage <= 1} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50 dark:border-slate-600">{t('userManagement.previous')}</button>
          <span>{safeCurrentPage} / {totalPages}</span>
          <button type="button" aria-label={t('userManagement.next')} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safeCurrentPage >= totalPages} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50 dark:border-slate-600">{t('userManagement.next')}</button>
        </div>
      </div>
      </section>
      {approvalRequest && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <button type="button" aria-label={t('userManagement.cancel')} className="absolute inset-0 cursor-default" onClick={() => { if (!approvalSaving) { setApprovalRequest(null); setApprovalValidationError('') } }} />
          <section role="dialog" aria-modal="true" aria-labelledby="approval-dialog-title" className="relative w-full max-w-md border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h2 id="approval-dialog-title" className="text-base font-semibold text-slate-900 dark:text-white">
                {approvalRequest.type === 'approve' ? t('userManagement.approvalTitle') : t('userManagement.rejectionTitle')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {approvalRequest.type === 'approve' ? t('userManagement.approvalMessage') : t('userManagement.rejectionMessage')}
              </p>
              {approvalRequest.type === 'reject' && (
                <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t('userManagement.rejectionReason')}
                  <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder={t('userManagement.rejectionReasonPlaceholder')} rows={4} autoFocus className="mt-1 block w-full resize-none border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
                </label>
              )}
              {approvalValidationError && <p role="alert" className="mt-3 text-center text-sm font-medium text-rose-600 dark:text-rose-300">{approvalValidationError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4">
              <button type="button" onClick={() => void submitApprovalRequest()} disabled={approvalSaving} className={`px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${approvalRequest.type === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{approvalSaving ? t('common.loading') : approvalRequest.type === 'approve' ? t('userManagement.approve') : t('userManagement.reject')}</button>
              <button type="button" onClick={() => { setApprovalRequest(null); setApprovalValidationError('') }} disabled={approvalSaving} className="border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">{t('userManagement.cancel')}</button>
            </div>
          </section>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(confirmation)}
        title={confirmation?.title ?? ''}
        message={confirmation?.message ?? ''}
        variant={confirmation?.variant ?? 'default'}
        confirmLabel={t('userManagement.confirm')}
        cancelLabel={t('userManagement.cancel')}
        onCancel={() => {
          confirmation?.resolve(false)
          setConfirmation(null)
        }}
        onConfirm={() => {
          confirmation?.resolve(true)
          setConfirmation(null)
        }}
      />
    </>
  )
}
