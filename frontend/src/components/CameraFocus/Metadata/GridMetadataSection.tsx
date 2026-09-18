import type { MetadataPollingState, MetadataSectionConfig } from '@/types/metadataConfig'
import { MetadataSectionStatus } from './MetadataSectionStatus'
import { displayValue } from './TextMetadataSection'

interface GridMetadataSectionProps {
  section: MetadataSectionConfig
  polling: MetadataPollingState
  onSelectEvent?: (eventId: number) => void
}

export function GridMetadataSection({ section, polling, onSelectEvent }: GridMetadataSectionProps) {
  const mapping = section.mapping
  if (!('columns' in mapping)) return <MetadataSectionStatus status="error" message="그리드 필드 설정이 올바르지 않습니다." />
  return (
    <div className="space-y-2">
      <MetadataSectionStatus status={polling.status} message={polling.error?.message} />
      {polling.result?.rows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs"><thead><tr>{mapping.columns.map((column) => <th key={column.field} className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold dark:border-slate-700 dark:bg-slate-900">{column.label ?? polling.result?.schema.find((field) => field.name === column.field)?.label ?? column.field}</th>)}{mapping.playbackAvailableField ? <th className="border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">재생</th> : null}</tr></thead><tbody>{polling.result.rows.map((row, index) => <tr key={`${section.id}-${index}`}>{mapping.columns.map((column) => <td key={column.field} className="border border-slate-200 px-2 py-1 dark:border-slate-700">{formatCell(row[column.field], column.format)}</td>)}{mapping.playbackAvailableField ? <td className="border border-slate-200 px-2 py-1 text-center dark:border-slate-700">{row[mapping.playbackAvailableField] ? <button type="button" className="text-blue-600 underline" onClick={() => { const value = mapping.eventIdField ? row[mapping.eventIdField] : undefined; if (typeof value === 'number') onSelectEvent?.(value) }}>재생</button> : '-'}</td> : null}</tr>)}</tbody></table>
        </div>
      ) : null}
    </div>
  )
}

function formatCell(value: unknown, format?: string) {
  if (format === 'datetime' && typeof value === 'string') return new Date(value).toLocaleString('ko-KR')
  return displayValue(value)
}
