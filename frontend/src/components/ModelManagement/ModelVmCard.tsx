import type { ModelProcess, ModelVm } from '@/types/modelManagement'
import { formatStatusTime, statusTone, vmStatusLabel } from './modelManagementUi'
import { ModelProcessHoneycomb } from './ModelProcessHoneycomb'

interface ModelVmCardProps {
  vm: ModelVm
  accentIndex: number
  selectedProcessId?: string
  onSelect: (process: ModelProcess) => void
}

export function ModelVmCard({ vm, accentIndex, selectedProcessId, onSelect }: ModelVmCardProps) {
  const accents = [{ label: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500', tone: 'sky' as const }, { label: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', tone: 'emerald' as const }, { label: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', tone: 'amber' as const }, { label: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500', tone: 'violet' as const }]
  const accent = accents[accentIndex % accents.length]
  return <section className="border-b border-slate-200 pb-5 pt-2 last:border-b-0 dark:border-slate-700">
    <header className="flex flex-wrap items-center justify-between gap-3 px-2"><div className="flex min-w-0 items-center gap-2"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot}`} aria-hidden="true" /><div><h2 className={`truncate text-sm font-semibold ${accent.label}`}>{vm.vmName}</h2><p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">{vm.hostAddress}</p></div></div><div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"><span className={`rounded-full px-2.5 py-1 font-semibold ${statusTone[vm.connectionStatus]}`}>{vmStatusLabel[vm.connectionStatus]}</span><span>{vm.processes.length}개 프로세스</span><span>갱신 {formatStatusTime(vm.lastHeartbeatAt)}</span></div></header>
    <ModelProcessHoneycomb processes={vm.processes} selectedProcessId={selectedProcessId} groupTone={accent.tone} onSelect={onSelect} />
  </section>
}
