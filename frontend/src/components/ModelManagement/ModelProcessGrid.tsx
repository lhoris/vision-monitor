import type { ModelControlAction, ModelProcess } from '@/types/modelManagement'
import { formatStatusTime } from './modelManagementUi'
import { ModelProcessActions } from './ModelProcessActions'
import { ModelStatusBadge } from './ModelStatusBadge'

interface ModelProcessGridProps {
  processes: ModelProcess[]
  busyIds: Set<string>
  onControl: (id: string, action: ModelControlAction) => void
  onSettings: (process: ModelProcess) => void
  onLogs: (process: ModelProcess) => void
  onDelete: (process: ModelProcess) => void
}

export function ModelProcessGrid({ processes, busyIds, onControl, onSettings, onLogs, onDelete }: ModelProcessGridProps) {
  return <section className="min-h-0 flex-1 overflow-auto border border-[#9dcced] bg-white dark:border-slate-700 dark:bg-slate-800">
    <table className="w-full min-w-[1600px] table-fixed border-separate border-spacing-0 text-left text-sm">
      <colgroup><col className="w-[90px]" /><col className="w-[220px]" /><col className="w-[200px]" /><col className="w-[130px]" /><col className="w-[120px]" /><col className="w-[120px]" /><col className="w-[130px]" /><col className="w-[280px]" /><col className="w-[140px]" /><col className="w-[90px]" /></colgroup>
      <thead className="sticky top-0 z-10"><tr>{['공정', '조업 자동화 기술명', '모델명', '프로세스 상태', '모니터링 현황', '제어 연동', '서버 IP', 'Python 프로젝트 경로', '최근 갱신', '작업'].map((title) => <th key={title} className="h-10 border-b border-r border-[#9dcced] bg-[#dff2ff] px-2 text-center text-xs font-semibold text-[#266b9f] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-100">{title}</th>)}</tr></thead>
      <tbody>{processes.map((process) => <tr key={process.id} className="text-slate-800 hover:bg-[#eef8ff] dark:text-slate-100 dark:hover:bg-slate-700">
        <td className="break-words border-b border-r border-[#b7d8ee] px-2 py-2 text-center align-middle dark:border-slate-700">{process.processName}</td>
        <td className="break-words border-b border-r border-[#b7d8ee] px-2 py-2 align-middle dark:border-slate-700">{process.automationName}</td>
        <td className="break-words border-b border-r border-[#b7d8ee] px-2 py-2 align-middle font-medium dark:border-slate-700">{process.modelName}</td>
        <td className="border-b border-r border-[#b7d8ee] px-2 py-2 text-center align-middle dark:border-slate-700"><ModelStatusBadge status={process.processStatus} kind="process" /></td>
        <td className="border-b border-r border-[#b7d8ee] px-2 py-2 text-center align-middle dark:border-slate-700"><ModelStatusBadge status={process.monitoringStatus} kind="link" /></td>
        <td className="border-b border-r border-[#b7d8ee] px-2 py-2 text-center align-middle dark:border-slate-700"><ModelStatusBadge status={process.controlStatus} kind="link" /></td>
        <td className="break-all border-b border-r border-[#b7d8ee] px-2 py-2 align-middle font-mono text-xs dark:border-slate-700">{process.serverIp}</td>
        <td className="break-all border-b border-r border-[#b7d8ee] px-2 py-2 align-middle font-mono text-xs dark:border-slate-700">{process.pythonProjectPath}</td>
        <td className="break-words border-b border-r border-[#b7d8ee] px-2 py-2 text-center align-middle text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300">{formatStatusTime(process.lastStatusAt)}</td>
        <td className="border-b border-r border-[#b7d8ee] px-2 py-2 align-middle dark:border-slate-700"><ModelProcessActions process={process} busy={busyIds.has(process.id)} onControl={(action) => onControl(process.id, action)} onSettings={() => onSettings(process)} onLogs={() => onLogs(process)} onDelete={() => onDelete(process)} /></td>
      </tr>)}{!processes.length && <tr><td colSpan={10} className="p-12 text-center text-sm text-slate-500">조건에 맞는 모델 프로세스가 없습니다.</td></tr>}</tbody>
    </table>
  </section>
}
