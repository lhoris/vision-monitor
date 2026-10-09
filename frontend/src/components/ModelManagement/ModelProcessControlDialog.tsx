import { Modal, Button } from '@/components/Common'
import type { ModelControlAction, ModelProcess } from '@/types/modelManagement'
import { ModelProcessControlStatus } from './ModelProcessControlStatus'
import { ModelStatusBadge } from './ModelStatusBadge'

interface ModelProcessControlDialogProps {
  process: ModelProcess | null
  busy: boolean
  onClose: () => void
  onControl: (action: ModelControlAction) => void
  onSettings: () => void
  onLogs: () => void
}

export function ModelProcessControlDialog({ process, busy, onClose, onControl, onSettings, onLogs }: ModelProcessControlDialogProps) {
  if (!process) return null
  return <Modal isOpen title="AI 모델 프로세스 제어" onClose={onClose} className="max-w-2xl overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900"><div className="-mx-6 -mt-4 space-y-4 p-5">
    <header className="rounded-lg bg-slate-900 px-5 py-4 text-white shadow-sm"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">MODEL PROCESS</p><h3 className="mt-1 truncate text-lg font-bold">{process.modelName}</h3><p className="mt-1 truncate text-sm text-slate-300">{process.automationName}</p></div><span className="shrink-0 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">운영 관리</span></div><div className="mt-4 flex flex-wrap gap-2"><ModelStatusBadge status={process.processStatus} kind="process" /><ModelStatusBadge status={process.monitoringStatus} kind="link" /><ModelProcessControlStatus status={process.controlRequestStatus} /></div></header>
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"><div className="mb-3 flex items-center justify-between"><div><h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">프로세스 제어</h4><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">작업을 선택하면 확인 후 제어 요청을 전송합니다.</p></div><span className="text-xs text-slate-400">{process.processName}</span></div><div className="grid grid-cols-3 gap-2"><Button size="sm" className="h-16 flex-col gap-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300" disabled={busy || process.processStatus === 'running'} onClick={() => onControl('start')}><span className="text-base leading-none">▶</span><span>시작</span></Button><Button size="sm" className="h-16 flex-col gap-1 bg-slate-600 text-white hover:bg-slate-700 disabled:bg-slate-300" disabled={busy || process.processStatus === 'stopped'} onClick={() => onControl('stop')}><span className="text-base leading-none">■</span><span>중지</span></Button><Button size="sm" className="h-16 flex-col gap-1 bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-300" disabled={busy} onClick={() => onControl('restart')}><span className="text-base leading-none">↻</span><span>재시작</span></Button></div></section>
    <section className="grid grid-cols-2 gap-x-5 gap-y-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-700 dark:bg-slate-800"><div><p className="text-slate-500 dark:text-slate-400">서버 IP</p><p className="mt-1 font-mono font-medium text-slate-800 dark:text-slate-100">{process.serverIp || '-'}</p></div><div><p className="text-slate-500 dark:text-slate-400">공정</p><p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{process.processName}</p></div><div className="col-span-2"><p className="text-slate-500 dark:text-slate-400">Python 프로젝트 경로</p><p className="mt-1 break-all font-mono text-slate-700 dark:text-slate-200">{process.pythonProjectPath || '-'}</p></div></section>
    <footer className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={onLogs}>이벤트 로그</Button><Button size="sm" variant="secondary" onClick={onSettings}>설정 변경</Button></footer>
  </div></Modal>
}
