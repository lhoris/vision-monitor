import type { ModelControlAction, ModelEventLog, ModelProcess } from '@/types/modelManagement'
import { ModelProcessCard } from './ModelProcessCard'

interface ModelProcessDetailPanelProps {
  process: ModelProcess | null
  busy: boolean
  logs: ModelEventLog[]
  onControl: (action: ModelControlAction) => void
  onSettings: () => void
  onLogs: () => void
}

export function ModelProcessDetailPanel({ process, busy, logs, onControl, onSettings, onLogs }: ModelProcessDetailPanelProps) {
  if (!process) return <aside className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">프로세스 셀을 선택하면 상세 정보와 제어 기능이 표시됩니다.</aside>
  return <aside className="min-h-0 overflow-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-sky-600">선택 프로세스</p><h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{process.modelName}</h2></div><span className="text-xs text-slate-500">이벤트 {logs.length}건</span></div><ModelProcessCard process={process} busy={busy} onControl={onControl} onSettings={onSettings} onLogs={onLogs} /><dl className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-xs dark:border-slate-700"><div><dt className="text-slate-500">모델 서버 IP</dt><dd className="mt-1 font-mono text-slate-800 dark:text-slate-100">{process.serverIp || '-'}</dd></div><div><dt className="text-slate-500">Python 프로젝트 경로</dt><dd className="mt-1 break-all font-mono text-slate-800 dark:text-slate-100">{process.pythonProjectPath || '-'}</dd></div><div><dt className="text-slate-500">모니터링 이벤트</dt><dd className="mt-1 text-slate-800 dark:text-slate-100">{logs.length ? logs[0].message : '최근 이벤트가 없습니다.'}</dd></div></dl></aside>
}
