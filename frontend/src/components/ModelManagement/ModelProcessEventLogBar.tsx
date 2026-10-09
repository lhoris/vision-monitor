import type { ModelEventLog, ModelProcess } from '@/types/modelManagement'

interface ModelProcessEventLogBarProps {
  process: ModelProcess | null
  logs: ModelEventLog[]
}

function severityClass(severity: ModelEventLog['severity']) {
  if (severity === 'error') return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
  if (severity === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
}

export function ModelProcessEventLogBar({ process, logs }: ModelProcessEventLogBarProps) {
  return <section className="shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" aria-live="polite">
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700"><div className="min-w-0"><h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">이벤트 로그</h2><p className="truncate text-xs text-slate-500 dark:text-slate-400">{process ? `${process.modelName} · ${process.processName}` : '벌집에서 모델 프로세스를 선택하세요.'}</p></div><span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{process ? `${logs.length}건` : '-'}</span></div>
    <div className="max-h-48 overflow-auto px-4 py-2">{!process ? <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">프로세스를 클릭하면 최근 이벤트 로그가 표시됩니다.</p> : logs.length ? <div className="min-w-[620px] text-xs"><div className="grid grid-cols-[150px_72px_minmax(220px,1fr)_minmax(140px,0.7fr)] gap-3 border-b border-slate-200 bg-slate-50 px-2 py-1.5 font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"><span>발생 시각</span><span>등급</span><span>메시지</span><span>탐지 결과</span></div><div className="divide-y divide-slate-100 dark:divide-slate-700">{logs.map((log) => <div key={log.id} className="grid grid-cols-[150px_72px_minmax(220px,1fr)_minmax(140px,0.7fr)] items-center gap-3 px-2 py-2"><time className="whitespace-nowrap text-slate-500 dark:text-slate-400" dateTime={log.occurredAt}>{new Date(log.occurredAt).toLocaleString('ko-KR')}</time><span className={`w-fit rounded px-1.5 py-0.5 font-semibold ${severityClass(log.severity)}`}>{log.severity}</span><span className="truncate text-slate-700 dark:text-slate-200" title={log.message}>{log.message}</span><span className="truncate font-mono text-slate-500 dark:text-slate-400" title={log.detectionSummary ?? undefined}>{log.detectionSummary ?? '-'}</span></div>)}</div></div> : <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">조회된 이벤트 로그가 없습니다.</p>}</div>
  </section>
}
