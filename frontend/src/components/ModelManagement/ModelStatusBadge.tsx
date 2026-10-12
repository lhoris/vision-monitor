import type { LinkStatus, ProcessStatus } from '@/types/modelManagement'
import { linkStatusLabel, processStatusLabel, statusTone } from './modelManagementUi'

const solidStatusTone: Record<string, string> = {
  running: 'bg-emerald-700 text-white',
  normal: 'bg-emerald-700 text-white',
  connected: 'bg-emerald-700 text-white',
  succeeded: 'bg-emerald-700 text-white',
  stopped: 'bg-rose-700 text-white',
  stopping: 'bg-rose-700 text-white',
  starting: 'bg-sky-700 text-white',
  restarting: 'bg-amber-700 text-white',
  checking: 'bg-amber-700 text-white',
  unknown: 'bg-amber-700 text-white',
  error: 'bg-rose-800 text-white',
  failed: 'bg-rose-700 text-white',
  disconnected: 'bg-rose-700 text-white',
  timeout: 'bg-rose-700 text-white',
}

export function ModelStatusBadge({ status, kind, variant = 'soft' }: { status: ProcessStatus | LinkStatus; kind: 'process' | 'link'; variant?: 'soft' | 'solid' }) {
  const label = kind === 'process' ? processStatusLabel[status as ProcessStatus] : linkStatusLabel[status as LinkStatus]
  const tone = variant === 'solid' ? solidStatusTone[status] ?? solidStatusTone.unknown : statusTone[status]
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{label}</span>
}
