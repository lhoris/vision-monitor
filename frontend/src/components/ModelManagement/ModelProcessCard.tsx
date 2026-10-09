import type { ModelControlAction, ModelProcess } from '@/types/modelManagement'
import { formatStatusTime } from './modelManagementUi'
import { ModelProcessActions } from './ModelProcessActions'
import { ModelProcessControlStatus } from './ModelProcessControlStatus'
import { ModelStatusBadge } from './ModelStatusBadge'

interface ModelProcessCardProps {
  process: ModelProcess
  busy: boolean
  onControl: (action: ModelControlAction) => void
  onSettings: () => void
  onLogs: () => void
}

export function ModelProcessCard({ process, busy, onControl, onSettings, onLogs }: ModelProcessCardProps) {
  return <article className="rounded border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{process.modelName}</p><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-300">{process.automationName}</p></div>
      <ModelProcessActions process={process} busy={busy} onControl={onControl} onSettings={onSettings} onLogs={onLogs} />
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2"><ModelStatusBadge status={process.processStatus} kind="process" /><ModelStatusBadge status={process.monitoringStatus} kind="link" /><ModelProcessControlStatus status={process.controlRequestStatus} /></div>
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs"><div><dt className="text-slate-500 dark:text-slate-400">공정</dt><dd className="mt-1 font-medium text-slate-800 dark:text-slate-100">{process.processName}</dd></div><div><dt className="text-slate-500 dark:text-slate-400">최근 갱신</dt><dd className="mt-1 text-slate-800 dark:text-slate-100">{formatStatusTime(process.lastStatusAt)}</dd></div><div className="col-span-2"><dt className="text-slate-500 dark:text-slate-400">Python 경로</dt><dd className="mt-1 truncate font-mono text-slate-700 dark:text-slate-200" title={process.pythonProjectPath}>{process.pythonProjectPath || '-'}</dd></div></dl>
  </article>
}
