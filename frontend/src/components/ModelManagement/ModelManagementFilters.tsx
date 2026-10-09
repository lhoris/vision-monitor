import type { ProcessStatus } from '@/types/modelManagement'

interface ModelManagementFiltersProps {
  status: ProcessStatus | 'all'
  search: string
  onStatusChange: (value: ProcessStatus | 'all') => void
  onSearchChange: (value: string) => void
}

export function ModelManagementFilters({ status, search, onStatusChange, onSearchChange }: ModelManagementFiltersProps) {
  return <div className="grid gap-3 md:grid-cols-[180px_minmax(220px,1.5fr)]"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300">프로세스 상태<select value={status} onChange={(event) => onStatusChange(event.target.value as ProcessStatus | 'all')} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal dark:border-slate-600 dark:bg-slate-800"><option value="all">전체 상태</option><option value="running">실행 중</option><option value="stopped">중지</option><option value="starting">시작 중</option><option value="stopping">중지 중</option><option value="restarting">재시작 중</option><option value="error">오류</option><option value="unknown">확인 필요</option></select></label><label className="text-xs font-semibold text-slate-600 dark:text-slate-300">검색<input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="VM, 모델명, 공정 검색" className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal dark:border-slate-800" /></label></div>
}
