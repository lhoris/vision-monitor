import type { ModelProcess, ModelVm } from '@/types/modelManagement'
import { ModelProcessHoneycomb } from './ModelProcessHoneycomb'
import { vmStatusLabel } from './modelManagementUi'

type GroupTone = 'sky' | 'emerald' | 'amber' | 'violet'

interface ModelVmDashboardProps {
  vms: ModelVm[]
  selectedProcessId?: string
  onSelect: (process: ModelProcess) => void
  onDoubleSelect?: (process: ModelProcess) => void
}

const tones: GroupTone[] = ['sky', 'emerald', 'amber', 'violet']
const toneClasses: Record<GroupTone, string> = { sky: 'bg-sky-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', violet: 'bg-violet-500' }

export function ModelVmDashboard({ vms, selectedProcessId, onSelect, onDoubleSelect }: ModelVmDashboardProps) {
  const processes = vms.flatMap((vm) => vm.processes)
  const groupToneByProcessId: Record<string, GroupTone> = {}
  vms.forEach((vm, index) => vm.processes.forEach((process) => { groupToneByProcessId[process.id] = tones[index % tones.length] }))

  if (!processes.length) return <div className="flex min-h-[280px] flex-1 items-center justify-center rounded border border-dashed border-slate-300 bg-white text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">조건에 맞는 VM 또는 AI 모델 프로세스가 없습니다.</div>
  return <section className="min-h-0 flex-1 overflow-auto px-2 py-2"><div className="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">{vms.map((vm, index) => { const tone = tones[index % tones.length]; return <span key={vm.vmId} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone]}`} aria-hidden="true" /><span className="font-semibold text-slate-700 dark:text-slate-200">{vm.vmName}</span><span>{vm.processes.length}개</span><span>{vmStatusLabel[vm.connectionStatus]}</span></span> })}</div><ModelProcessHoneycomb processes={processes} selectedProcessId={selectedProcessId} groupToneByProcessId={groupToneByProcessId} onSelect={onSelect} onDoubleSelect={onDoubleSelect} /></section>
}
