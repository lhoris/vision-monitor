import type { UserAccount } from '@/types/userManagement'
import { EmploymentStatusBadge, UserStatusBadge } from './UserStatusBadge'

interface UserDetailPanelProps {
  user: UserAccount | null
  onEdit: () => void
  onDanger: () => void
}

export function UserDetailPanel({ user, onEdit, onDanger }: UserDetailPanelProps) {
  if (!user) return <aside className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">사용자를 선택하세요.</aside>

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">사용자 상세</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{user.displayName}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{user.username}</p></div>
        <div className="flex gap-1"><UserStatusBadge status={user.accountStatus} /><EmploymentStatusBadge status={user.employmentStatus} /></div>
      </div>
      <dl className="mt-5 grid grid-cols-[90px_1fr] gap-y-3 text-sm"><dt className="text-slate-500">이름</dt><dd className="text-slate-900 dark:text-white">{user.name}</dd><dt className="text-slate-500">부서/직책</dt><dd className="text-slate-900 dark:text-white">{user.department} / {user.position || '-'}</dd><dt className="text-slate-500">이메일</dt><dd className="break-all text-slate-900 dark:text-white">{user.email}</dd><dt className="text-slate-500">연락처</dt><dd className="text-slate-900 dark:text-white">{user.phone || '-'}</dd><dt className="text-slate-500">역할</dt><dd className="text-slate-900 dark:text-white">{user.roles.map((role) => role.name).join(', ') || '-'}</dd><dt className="text-slate-500">개인화</dt><dd className="text-slate-900 dark:text-white">{user.personalization.hasSettings ? `보유 (${user.personalization.cameraGridCount}개 그리드)` : '없음'}</dd></dl>
      <div className="mt-6 flex gap-2"><button type="button" onClick={onEdit} className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">정보 수정</button><button type="button" onClick={onDanger} className="rounded-md border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-950/30">상태 관리</button></div>
    </aside>
  )
}
