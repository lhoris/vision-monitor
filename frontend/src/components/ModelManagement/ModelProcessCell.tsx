import type { ModelProcess } from '@/types/modelManagement'
import { ModelStatusBadge } from './ModelStatusBadge'

interface ModelProcessCellProps {
  process: ModelProcess
  selected: boolean
  groupTone: 'sky' | 'emerald' | 'amber' | 'violet'
  onSelect: () => void
}

export function ModelProcessCell({ process, selected, groupTone, onSelect }: ModelProcessCellProps) {
  const groupBackground = { sky: 'bg-sky-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', violet: 'bg-violet-500' }[groupTone]
  return <button type="button" aria-label={`${process.modelName} 프로세스 선택`} aria-pressed={selected} onClick={onSelect} className={`relative flex aspect-[1.1547] w-full flex-col items-center justify-center px-5 text-center transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${selected ? 'z-10 scale-[1.03] bg-blue-600 text-white' : `${groupBackground} text-white`} `} style={{ clipPath: 'polygon(25% 3%, 75% 3%, 98% 50%, 75% 97%, 25% 97%, 2% 50%)' }}>
    <span className="max-w-full truncate text-xs font-bold">{process.modelName}</span>
    <span className="mt-1 max-w-full truncate text-[11px] opacity-80">{process.processName}</span>
    <span className={`mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${selected ? 'bg-white/20 text-white' : 'bg-black/15 text-white'}`}><ModelStatusBadge status={process.processStatus} kind="process" /></span>
  </button>
}
