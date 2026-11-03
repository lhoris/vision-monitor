import type { AccountStatus, EmploymentStatus } from '@/types/userManagement'
import { useTranslation } from 'react-i18next'
import i18next from '@/i18n'

const accountClasses: Record<AccountStatus, string> = {
  pending: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  locked: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  disabled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
}

export function UserStatusBadge({ status }: { status: AccountStatus }) {
  const { t } = useTranslation()
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${accountClasses[status]}`}>{t(`userManagement.accountStatuses.${status}`)}</span>
}

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  const { t } = useTranslation()
  return <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">{t(`userManagement.employmentStatuses.${status}`)}</span>
}

export function accountStatusLabel(status: AccountStatus): string {
  return i18next.t(`userManagement.accountStatuses.${status}`)
}

export function employmentStatusLabel(status: EmploymentStatus): string {
  return i18next.t(`userManagement.employmentStatuses.${status}`)
}
