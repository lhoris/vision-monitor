import { useMemo, useState } from 'react'
import type { ColumnDefinition } from 'tabulator-tables'
import { useTabulator } from '@/lib/tabulator/useTabulator'
import type { RoleSummary, UserAccount, UserManagementFilters } from '@/types/userManagement'
import { accountStatusLabel, employmentStatusLabel } from './UserStatusBadge'

interface UserManagementGridProps {
  users: UserAccount[]
  roles: RoleSummary[]
  filters: UserManagementFilters
  onFiltersChange: (filters: UserManagementFilters) => void
  onSelect: (user: UserAccount) => void
}

function formatDate(value?: string): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function UserManagementGrid({ users, roles, filters, onFiltersChange, onSelect }: UserManagementGridProps) {
  const [pageSize, setPageSize] = useState(10)
  const filteredUsers = useMemo(() => users.filter((user) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [user.username, user.name, user.displayName, user.department, user.email].some((value) => value.toLowerCase().includes(query))
    const matchesRole = filters.roleId === 'all' || user.roleIds.includes(filters.roleId)
    const matchesAccount = filters.accountStatus === 'all' || user.accountStatus === filters.accountStatus
    const matchesEmployment = filters.employmentStatus === 'all' || user.employmentStatus === filters.employmentStatus
    return matchesQuery && matchesRole && matchesAccount && matchesEmployment
  }), [filters, users])

  const columns = useMemo<ColumnDefinition[]>(() => [
    { title: '사용자 ID', field: 'username', width: 130, headerSort: true },
    { title: '이름', field: 'displayName', minWidth: 140, widthGrow: 1 },
    { title: '부서/소속', field: 'department', minWidth: 140, widthGrow: 1 },
    { title: '역할', field: 'roles', minWidth: 120, formatter: (cell) => (cell.getValue() as RoleSummary[]).map((role) => role.name).join(', ') },
    { title: '계정 상태', field: 'accountStatus', width: 110, formatter: (cell) => accountStatusLabel(cell.getValue() as UserAccount['accountStatus']) },
    { title: '재직 상태', field: 'employmentStatus', width: 110, formatter: (cell) => employmentStatusLabel(cell.getValue() as UserAccount['employmentStatus']) },
    { title: '마지막 접속', field: 'lastLoginAt', width: 150, formatter: (cell) => formatDate(cell.getValue() as string | undefined) },
  ], [])

  const tableOptions = useMemo(() => ({
    pagination: true,
    paginationSize: pageSize,
    paginationSizeSelector: [10, 25, 50],
    selectableRows: 1,
    rowClick: (_event: Event, row: { getData: () => UserAccount }) => onSelect(row.getData()),
    cellClick: (_event: Event, cell: { getRow: () => { getData: () => UserAccount } }) => onSelect(cell.getRow().getData()),
    placeholder: '조건에 맞는 사용자가 없습니다.',
  }), [onSelect, pageSize])

  const { mountRef } = useTabulator({
    data: filteredUsers,
    columns,
    tableOptions,
  })

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-700">
        <input
          aria-label="사용자 검색"
          value={filters.query}
          onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
          placeholder="사용자 ID, 이름, 부서, 이메일 검색"
          className="min-w-[240px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
        <select aria-label="역할 필터" value={filters.roleId} onChange={(event) => onFiltersChange({ ...filters, roleId: event.target.value })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <option value="all">전체 역할</option>
          {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
        </select>
        <select aria-label="계정 상태 필터" value={filters.accountStatus} onChange={(event) => onFiltersChange({ ...filters, accountStatus: event.target.value as UserManagementFilters['accountStatus'] })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <option value="all">전체 계정 상태</option><option value="active">활성</option><option value="locked">잠금</option><option value="disabled">비활성</option>
        </select>
        <select aria-label="재직 상태 필터" value={filters.employmentStatus} onChange={(event) => onFiltersChange({ ...filters, employmentStatus: event.target.value as UserManagementFilters['employmentStatus'] })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <option value="all">전체 재직 상태</option><option value="employed">재직</option><option value="leave">휴직</option><option value="retired">퇴사</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          표시 건수
          <select aria-label="표시 건수" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>
        </label>
      </div>
      <div ref={mountRef} className="vm-tabulator min-h-[360px] flex-1" />
      <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">총 {filteredUsers.length}명 · 행을 선택하면 상세 정보를 확인할 수 있습니다.</p>
    </section>
  )
}
