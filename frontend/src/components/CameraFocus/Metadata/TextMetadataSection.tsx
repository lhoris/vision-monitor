import type { MetadataPollingState, MetadataSectionConfig } from '@/types/metadataConfig'
import { MetadataSectionStatus } from './MetadataSectionStatus'

export function TextMetadataSection({ section, polling }: { section: MetadataSectionConfig; polling: MetadataPollingState }) {
  const mapping = section.mapping
  const rows = polling.result?.rows ?? []
  const displayMode = section.textDisplayMode ?? ('valueField' in mapping ? 'label_value' : 'free')
  const labelField = displayMode === 'label_value' && 'labelField' in mapping ? mapping.labelField : undefined
  const valueField = displayMode === 'label_value' && 'valueField' in mapping ? mapping.valueField : undefined
  const fields = 'fields' in mapping ? mapping.fields ?? [] : []

  return (
    <div className="space-y-2">
      <MetadataSectionStatus status={polling.status} message={polling.error?.message} />
      {displayMode === 'label_value' && rows.length && valueField ? (
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          {rows.map((row, index) => <div key={`${section.id}-${index}`} className="flex justify-between gap-3"><span className="text-slate-500">{labelField ? displayValue(row[labelField]) : ''}</span><strong>{displayValue(valueField ? row[valueField] : row[fields[index] ?? 'value'])}</strong></div>)}
        </div>
      ) : section.defaultText ? <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{section.defaultText}</p> : rows.length ? <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{rows.map((row) => Object.values(row).map(displayValue).join(' ')).join('\n')}</p> : null}
    </div>
  )
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? '가능' : '불가'
  return String(value)
}
