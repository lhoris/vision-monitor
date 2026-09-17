import type { LinkStatus, ProcessStatus } from '@/types/modelManagement'
import { linkStatusLabel, processStatusLabel, statusTone } from './modelManagementUi'

export function ModelStatusBadge({ status, kind }: { status: ProcessStatus | LinkStatus; kind: 'process' | 'link' }) {
  const label = kind === 'process' ? processStatusLabel[status as ProcessStatus] : linkStatusLabel[status as LinkStatus]
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${statusTone[status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{label}</span>
}
