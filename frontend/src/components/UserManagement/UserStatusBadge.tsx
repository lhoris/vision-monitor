import type { AccountStatus, EmploymentStatus } from '@/types/userManagement'

const accountLabels: Record<AccountStatus, string> = {
  active: '활성',
  locked: '잠금',
  disabled: '비활성',
}

const employmentLabels: Record<EmploymentStatus, string> = {
  employed: '재직',
  leave: '휴직',
  retired: '퇴사',
}

const accountClasses: Record<AccountStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  locked: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  disabled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
}

export function UserStatusBadge({ status }: { status: AccountStatus }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${accountClasses[status]}`}>{accountLabels[status]}</span>
}

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  return <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">{employmentLabels[status]}</span>
}

export function accountStatusLabel(status: AccountStatus): string {
  return accountLabels[status]
}

export function employmentStatusLabel(status: EmploymentStatus): string {
  return employmentLabels[status]
}
