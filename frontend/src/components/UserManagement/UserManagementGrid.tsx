import { useEffect, useMemo, useState } from 'react'
import type {
  AccountStatus,
  EmploymentStatus,
  RoleSummary,
  UserAccount,
  UserDangerAction,
  UserGridRowState,
  UserGridSaveRequest,
  UserManagementFilters,
  UserMutationRequest,
} from '@/types/userManagement'
import { canPerformDangerAction, validateUserMutation, type UserValidationErrors } from '@/services/userManagementValidation'
import { accountStatusLabel, employmentStatusLabel } from './UserStatusBadge'

interface UserManagementGridProps {
  users: UserAccount[]
  roles: RoleSummary[]
  currentUsername: string
  onSaveChanges: (changes: UserGridSaveRequest[]) => Promise<void>
  onBatchAction: (action: UserDangerAction, userIds: number[]) => Promise<void>
  onRefresh: () => Promise<void>
}

type EditableField = keyof UserMutationRequest

interface UserGridRow extends UserMutationRequest {
  rowId: string
  id?: number
  roles: RoleSummary[]
  lastLoginAt?: string
  updatedAt?: string
  state: UserGridRowState
  fieldErrors: UserValidationErrors
}

const initialFilters: UserManagementFilters = {
  query: '',
  roleId: 'all',
  accountStatus: 'all',
  employmentStatus: 'all',
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

let draftSequence = 0

function toMutationInput(row: UserGridRow): UserMutationRequest {
  return {
    username: row.username,
    name: row.name,
    displayName: row.displayName,
    department: row.department,
    position: row.position,
    email: row.email,
    phone: row.phone,
    orgUnitId: row.orgUnitId,
    roleIds: row.roleIds,
    accountStatus: row.accountStatus,
    employmentStatus: row.employmentStatus,
  }
}

function toGridRow(user: UserAccount): UserGridRow {
  return {
    rowId: String(user.id),
    id: user.id,
    username: user.username,
    name: user.name,
    displayName: user.displayName,
    department: user.department,
    position: user.position,
    email: user.email,
    phone: user.phone,
    orgUnitId: user.orgUnitId,
    roleIds: user.roleIds,
    roles: user.roles,
    accountStatus: user.accountStatus,
    employmentStatus: user.employmentStatus,
    lastLoginAt: user.lastLoginAt,
    updatedAt: user.updatedAt,
    state: 'clean',
    fieldErrors: {},
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

export function UserManagementGrid({
  users,
  roles,
  currentUsername,
  onSaveChanges,
  onBatchAction,
  onRefresh,
}: UserManagementGridProps) {
  const [rows, setRows] = useState<UserGridRow[]>([])
  const [filters, setFilters] = useState<UserManagementFilters>(initialFilters)
  const [pageSize, setPageSize] = useState(25)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    setRows(users.map(toGridRow))
    setSelectedRowIds(new Set())
    setLocalError('')
  }, [users])

  const filteredRows = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesQuery =
        !query ||
        [row.username, row.name, row.displayName, row.department, row.position, row.email, row.phone]
          .some((value) => value.toLowerCase().includes(query))
      const matchesRole = filters.roleId === 'all' || row.roleIds.includes(filters.roleId)
      const matchesAccount = filters.accountStatus === 'all' || row.accountStatus === filters.accountStatus
      const matchesEmployment = filters.employmentStatus === 'all' || row.employmentStatus === filters.employmentStatus
      return matchesQuery && matchesRole && matchesAccount && matchesEmployment
    })
  }, [filters, rows])

  const visibleRows = filteredRows.slice(0, pageSize)
  const changedRows = rows.filter((row) => row.state === 'new' || row.state === 'dirty')
  const selectedPersistedRows = rows.filter((row) => selectedRowIds.has(row.rowId) && row.id)
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedRowIds.has(row.rowId))

  const updateRow = (rowId: string, field: EditableField, value: UserMutationRequest[EditableField]) => {
    setRows((current) => current.map((row) => {
      if (row.rowId !== rowId) return row
      const next = { ...row, [field]: value, fieldErrors: { ...row.fieldErrors, [field]: undefined } }
      return { ...next, state: row.state === 'new' ? 'new' : 'dirty' }
    }))
  }

  const addRow = () => {
    const draft = createDraftRow(roles)
    setRows((current) => [draft, ...current])
    setSelectedRowIds(new Set([draft.rowId]))
    setLocalError('')
  }

  const cancelChanges = () => {
    setRows(users.map(toGridRow))
    setSelectedRowIds(new Set())
    setLocalError('')
  }

  const validateChangedRows = (): UserGridSaveRequest[] => {
    const duplicateDraftUsernames = new Map<string, number>()
    changedRows.forEach((row) => {
      const username = row.username.trim()
      if (username) duplicateDraftUsernames.set(username, (duplicateDraftUsernames.get(username) ?? 0) + 1)
    })

    const nextChanges: UserGridSaveRequest[] = []
    const nextRows = rows.map((row) => {
      if (row.state !== 'new' && row.state !== 'dirty') return row
      const input = toMutationInput(row)
      const errors = validateUserMutation(input, users, row.id)
      if ((duplicateDraftUsernames.get(input.username.trim()) ?? 0) > 1) {
        errors.username = '변경 목록 안에서 사용자 ID가 중복됩니다.'
      }
      if (Object.keys(errors).length) return { ...row, state: 'invalid' as const, fieldErrors: errors }
      nextChanges.push({ rowId: row.rowId, userId: row.id, input })
      return { ...row, state: 'saving' as const, fieldErrors: {} }
    })

    setRows(nextRows)
    return nextChanges
  }

  const saveChanges = async () => {
    setLocalError('')
    const changes = validateChangedRows()
    if (!changes.length) {
      setLocalError(changedRows.length ? '저장할 수 없는 오류가 있습니다.' : '저장할 변경 사항이 없습니다.')
      return
    }
    setSaving(true)
    try {
      await onSaveChanges(changes)
    } catch {
      setRows((current) => current.map((row) => row.state === 'saving' ? { ...row, state: row.id ? 'dirty' : 'new' } : row))
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

  const runBatchAction = async (action: UserDangerAction) => {
    setLocalError('')
    const targets = selectedPersistedRows.filter((row): row is UserGridRow & { id: number } => Boolean(row.id))
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

    if (!window.confirm(`${targets.length}명의 사용자를 ${actionLabel[action]} 처리할까요?`)) return

    setRows((current) => current.map((row) => selectedRowIds.has(row.rowId) ? { ...row, state: 'saving' } : row))
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

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
        <input
          aria-label="사용자 검색"
          value={filters.query}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          placeholder="사용자 ID, 이름, 부서, 이메일 검색"
          className="min-w-[240px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
        <select aria-label="역할 필터" value={filters.roleId} onChange={(event) => setFilters({ ...filters, roleId: event.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <option value="all">전체 역할</option>
          {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
        </select>
        <select aria-label="계정 상태 필터" value={filters.accountStatus} onChange={(event) => setFilters({ ...filters, accountStatus: event.target.value as UserManagementFilters['accountStatus'] })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <option value="all">전체 계정 상태</option>
          <option value="active">활성</option>
          <option value="locked">잠금</option>
          <option value="disabled">비활성</option>
        </select>
        <select aria-label="재직 상태 필터" value={filters.employmentStatus} onChange={(event) => setFilters({ ...filters, employmentStatus: event.target.value as UserManagementFilters['employmentStatus'] })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <option value="all">전체 재직 상태</option>
          <option value="employed">재직</option>
          <option value="leave">휴직</option>
          <option value="retired">퇴사</option>
        </select>
        <select aria-label="표시 건수" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
        <button type="button" onClick={addRow} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">행 추가</button>
        <button type="button" onClick={() => void saveChanges()} disabled={saving || !changedRows.length} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">저장</button>
        <button type="button" onClick={cancelChanges} disabled={saving || !changedRows.length} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">변경 취소</button>
        <button type="button" onClick={() => void onRefresh()} disabled={saving} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">새로고침</button>
        <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
        {(['lock', 'unlock', 'disable', 'retire', 'delete-request'] as const).map((action) => (
          <button key={action} type="button" onClick={() => void runBatchAction(action)} disabled={saving || !selectedPersistedRows.length} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">
            {actionLabel[action]}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          선택 {selectedPersistedRows.length}명 / 변경 {changedRows.length}건
        </span>
      </div>

      {(localError || changedRows.length > 0) && (
        <div className="border-b border-slate-200 px-4 py-2 text-sm dark:border-slate-700">
          {localError ? <span className="text-rose-700 dark:text-rose-300">{localError}</span> : <span className="text-amber-700 dark:text-amber-300">저장되지 않은 변경 사항이 있습니다.</span>}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-[1280px] w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-semibold uppercase text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="w-10 border-b border-slate-200 p-2 dark:border-slate-700">
                <input aria-label="표시 행 전체 선택" type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleRows} />
              </th>
              <th className="w-24 border-b border-slate-200 p-2 dark:border-slate-700">상태</th>
              <th className="w-36 border-b border-slate-200 p-2 dark:border-slate-700">사용자 ID</th>
              <th className="w-32 border-b border-slate-200 p-2 dark:border-slate-700">이름</th>
              <th className="w-32 border-b border-slate-200 p-2 dark:border-slate-700">표시명</th>
              <th className="w-36 border-b border-slate-200 p-2 dark:border-slate-700">부서</th>
              <th className="w-28 border-b border-slate-200 p-2 dark:border-slate-700">직책</th>
              <th className="w-52 border-b border-slate-200 p-2 dark:border-slate-700">이메일</th>
              <th className="w-36 border-b border-slate-200 p-2 dark:border-slate-700">연락처</th>
              <th className="w-32 border-b border-slate-200 p-2 dark:border-slate-700">역할</th>
              <th className="w-28 border-b border-slate-200 p-2 dark:border-slate-700">계정</th>
              <th className="w-28 border-b border-slate-200 p-2 dark:border-slate-700">재직</th>
              <th className="w-36 border-b border-slate-200 p-2 dark:border-slate-700">마지막 접속</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.rowId} className={`${rowClassName(row.state)} text-slate-800 dark:text-slate-100`}>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label={`${row.username || row.displayName || '신규 행'} 선택`} type="checkbox" checked={selectedRowIds.has(row.rowId)} onChange={() => toggleRow(row.rowId)} />
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-100">{stateLabel[row.state]}</span>
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label="사용자 ID" value={row.username} disabled={Boolean(row.id)} onChange={(event) => updateRow(row.rowId, 'username', event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:disabled:bg-slate-700" />
                  {renderError(row, 'username')}
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label="이름" value={row.name} onChange={(event) => updateRow(row.rowId, 'name', event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                  {renderError(row, 'name')}
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label="표시명" value={row.displayName} onChange={(event) => updateRow(row.rowId, 'displayName', event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                  {renderError(row, 'displayName')}
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label="부서" value={row.department} onChange={(event) => updateRow(row.rowId, 'department', event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label="직책" value={row.position} onChange={(event) => updateRow(row.rowId, 'position', event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label="이메일" value={row.email} onChange={(event) => updateRow(row.rowId, 'email', event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                  {renderError(row, 'email')}
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <input aria-label="연락처" value={row.phone} onChange={(event) => updateRow(row.rowId, 'phone', event.target.value)} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <select aria-label="역할" value={row.roleIds[0] ?? ''} onChange={(event) => updateRow(row.rowId, 'roleIds', event.target.value ? [event.target.value] : [])} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900">
                    <option value="">선택</option>
                    {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                  {renderError(row, 'roleIds')}
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <select aria-label="계정 상태" value={row.accountStatus} onChange={(event) => updateRow(row.rowId, 'accountStatus', event.target.value as AccountStatus)} className="mb-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900">
                    <option value="active">활성</option>
                    <option value="locked">잠금</option>
                    <option value="disabled">비활성</option>
                  </select>
                  <span className="text-xs text-slate-500">{accountStatusLabel(row.accountStatus)}</span>
                </td>
                <td className="border-b border-slate-100 p-2 dark:border-slate-700">
                  <select aria-label="재직 상태" value={row.employmentStatus} onChange={(event) => updateRow(row.rowId, 'employmentStatus', event.target.value as EmploymentStatus)} className="mb-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900">
                    <option value="employed">재직</option>
                    <option value="leave">휴직</option>
                    <option value="retired">퇴사</option>
                  </select>
                  <span className="text-xs text-slate-500">{employmentStatusLabel(row.employmentStatus)}</span>
                </td>
                <td className="border-b border-slate-100 p-2 text-xs text-slate-500 dark:border-slate-700">{formatDate(row.lastLoginAt)}</td>
              </tr>
            ))}
            {!visibleRows.length && (
              <tr>
                <td colSpan={13} className="p-8 text-center text-sm text-slate-500">조건에 맞는 사용자가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        총 {filteredRows.length}명 - 행 추가와 셀 편집 후 저장을 눌러 변경을 반영합니다.
      </p>
    </section>
  )
}
