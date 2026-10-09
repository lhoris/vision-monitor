import type { ControlRequestStatus } from '@/types/modelManagement'
import { controlRequestStatusLabel, statusTone } from './modelManagementUi'

export function ModelProcessControlStatus({ status }: { status?: ControlRequestStatus }) {
  if (!status) return null
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusTone[status]}`}>제어 {controlRequestStatusLabel[status]}</span>
}
