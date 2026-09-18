import type { MetadataPollingState, MetadataSectionConfig } from '@/types/metadataConfig'
import { MetadataSectionStatus } from './MetadataSectionStatus'
import { displayValue } from './TextMetadataSection'

export function ChartMetadataSection({ section, polling }: { section: MetadataSectionConfig; polling: MetadataPollingState }) {
  const mapping = section.mapping
  if (!('timeField' in mapping)) return <MetadataSectionStatus status="error" message="차트 필드 설정이 올바르지 않습니다." />
  return (
    <div className="space-y-2">
      <MetadataSectionStatus status={polling.status} message={polling.error?.message} />
      {polling.result?.rows.length ? <div className="space-y-2" role="img" aria-label={`${section.title} 차트`}>{polling.result.rows.map((row, index) => <div key={`${section.id}-${index}`} className="grid grid-cols-[auto_1fr] items-center gap-2 text-xs"><span className="text-slate-500">{displayValue(row[mapping.timeField])}</span><div className="flex gap-2">{mapping.series.map((series) => <span key={series.field} className="border px-2 py-1" style={{ borderColor: series.color ?? '#64748b' }}>{series.label}: {displayValue(row[series.field])}</span>)}</div></div>)}</div> : null}
    </div>
  )
}
