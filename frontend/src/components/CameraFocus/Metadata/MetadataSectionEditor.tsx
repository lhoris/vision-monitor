import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetadataChartMapping, MetadataGridMapping, MetadataQueryDefinition, MetadataSectionConfig, MetadataSectionType, MetadataTextDisplayMode, MetadataTextMapping } from '@/types/metadataConfig'

interface MetadataSectionEditorProps {
  section?: MetadataSectionConfig
  queries: MetadataQueryDefinition[]
  onSave: (section: MetadataSectionConfig) => void
  onClose: () => void
}

export function MetadataSectionEditor({ section, queries, onSave, onClose }: MetadataSectionEditorProps) {
  const { t, i18n } = useTranslation()
  const [title, setTitle] = useState(section?.title ?? '')
  const [type, setType] = useState<MetadataSectionType>(section?.type ?? 'grid')
  const [textDisplayMode, setTextDisplayMode] = useState<MetadataTextDisplayMode>(getTextDisplayMode(section))
  const [queryId, setQueryId] = useState(section?.queryId ?? queries[0]?.queryId ?? '')
  const [defaultText, setDefaultText] = useState(section?.defaultText ?? '')
  const [interval, setInterval] = useState(section?.refreshIntervalSec ?? 10)
  const [labelField, setLabelField] = useState('')
  const [valueField, setValueField] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [timeField, setTimeField] = useState('')
  const [seriesFields, setSeriesFields] = useState<string[]>([])

  const query = queries.find((item) => item.queryId === queryId)
  const fields = query?.resultSchema ?? []
  const language = i18n.resolvedLanguage ?? i18n.language ?? 'ko'
  const queryDescription = query ? getQueryDescription(query, language) : ''

  useEffect(() => {
    if (!query) return
    const mapping = section?.queryId === query.queryId ? section.mapping : undefined
    if (mapping && 'valueField' in mapping) {
      setLabelField(mapping.labelField ?? fields[0]?.name ?? '')
      setValueField(mapping.valueField ?? fields[1]?.name ?? fields[0]?.name ?? '')
    } else {
      setLabelField(fields[0]?.name ?? '')
      setValueField(fields[1]?.name ?? fields[0]?.name ?? '')
    }
    if (mapping && 'columns' in mapping) setSelectedFields(mapping.columns.map((column) => column.field))
    else setSelectedFields(fields.map((field) => field.name))
    if (mapping && 'timeField' in mapping) {
      setTimeField(mapping.timeField)
      setSeriesFields(mapping.series.map((series) => series.field))
    } else {
      setTimeField(fields.find((field) => field.type === 'datetime')?.name ?? fields[0]?.name ?? '')
      setSeriesFields(fields.filter((field) => field.type === 'number').map((field) => field.name))
    }
  }, [queryId])

  function submit(event: FormEvent) {
    event.preventDefault()
    if ((!query && type !== 'text') || !title.trim()) return
    if (type === 'text' && textDisplayMode === 'label_value' && !query) return
    let mapping: MetadataTextMapping | MetadataGridMapping | MetadataChartMapping
    if (type === 'text' && textDisplayMode === 'label_value') mapping = { ...(labelField ? { labelField } : {}), ...(valueField ? { valueField } : {}) }
    else if (type === 'text') mapping = {}
    else if (type === 'chart') mapping = { timeField, series: seriesFields.map((field) => ({ field, label: fields.find((item) => item.name === field)?.label ?? field })) }
    else mapping = { columns: selectedFields.map((field) => ({ field, label: fields.find((item) => item.name === field)?.label ?? field })) }
    if (type !== 'text' && !query) return
    onSave({ id: section?.id ?? `section-${Date.now()}`, title: title.trim(), type, textDisplayMode: type === 'text' ? textDisplayMode : undefined, order: section?.order ?? 99, visible: true, queryId: queryId || undefined, refreshIntervalSec: interval, mapping, defaultText: type === 'text' ? defaultText : undefined, sourceProfileStatus: 'included' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 border bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between"><h3 className="font-semibold">{t('cameraFocus.metadata.sectionSettings')}</h3><button type="button" onClick={onClose} aria-label={t('common.close')}>×</button></div>
        <label className="block text-sm">{t('cameraFocus.metadata.title')}<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900" required /></label>
        <label className="block text-sm">{t('cameraFocus.metadata.displayFormat')}<select value={type} onChange={(event) => setType(event.target.value as MetadataSectionType)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900"><option value="text">{t('cameraFocus.metadata.text')}</option><option value="grid">{t('cameraFocus.metadata.grid')}</option><option value="chart">{t('cameraFocus.metadata.chart')}</option></select></label>
        <label className="block text-sm">{t('cameraFocus.metadata.queryId')}{type === 'text' ? ` (${t('cameraFocus.metadata.optional')})` : ''}<select value={queryId} onChange={(event) => setQueryId(event.target.value)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900">{type === 'text' ? <option value="">{t('cameraFocus.metadata.noQuery')}</option> : null}{queries.map((item) => <option key={item.queryId} value={item.queryId}>{item.queryId}{getQueryDescription(item, language) ? ` - ${getQueryDescription(item, language)}` : ''}</option>)}</select></label>
        {query ? <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400"><span className="font-medium">{t('cameraFocus.metadata.queryDescription')}:</span> {queryDescription || '-'}</p> : null}
        <label className="block text-sm">{t('cameraFocus.metadata.refreshInterval')}<input type="number" min={0.1} max={3600} step={0.1} value={interval} onChange={(event) => setInterval(Math.max(0.1, Math.min(3600, Number(event.target.value) || 0.1)))} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900" required /></label>
        {type === 'text' ? <>
          <label className="block text-sm">{t('cameraFocus.metadata.textDisplayFormat')}<select value={textDisplayMode} onChange={(event) => setTextDisplayMode(event.target.value as MetadataTextDisplayMode)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900"><option value="free">{t('cameraFocus.metadata.freeText')}</option><option value="label_value">{t('cameraFocus.metadata.labelValue')}</option></select></label>
          <label className="block text-sm">{t('cameraFocus.metadata.defaultText')}<textarea value={defaultText} onChange={(event) => setDefaultText(event.target.value)} rows={3} placeholder={t('cameraFocus.metadata.defaultTextPlaceholder')} className="mt-1 w-full resize-y border px-3 py-2 dark:bg-slate-900" /></label>
          {textDisplayMode === 'label_value' && query ? <div className="grid grid-cols-2 gap-2"><FieldSelect label="라벨 필드" value={labelField} fields={fields} onChange={setLabelField} /><FieldSelect label="값 필드" value={valueField} fields={fields} onChange={setValueField} /></div> : null}
          {textDisplayMode === 'label_value' && !query ? <p className="text-xs text-red-600">{t('cameraFocus.metadata.labelValueRequiresQuery')}</p> : null}
        </> : null}
        {type === 'grid' ? <fieldset className="space-y-2"><legend className="text-sm">{t('cameraFocus.metadata.displayColumns')}</legend>{fields.map((field) => <label key={field.name} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selectedFields.includes(field.name)} onChange={(event) => setSelectedFields((current) => event.target.checked ? [...current, field.name] : current.filter((item) => item !== field.name))} />{field.label} ({field.name})</label>)}</fieldset> : null}
        {type === 'chart' ? <div className="space-y-2"><FieldSelect label={t('cameraFocus.metadata.timeField')} value={timeField} fields={fields} onChange={setTimeField} /><fieldset><legend className="text-sm">{t('cameraFocus.metadata.seriesFields')}</legend>{fields.filter((field) => field.name !== timeField).map((field) => <label key={field.name} className="mr-3 inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={seriesFields.includes(field.name)} onChange={(event) => setSeriesFields((current) => event.target.checked ? [...current, field.name] : current.filter((item) => item !== field.name))} />{field.label}</label>)}</fieldset></div> : null}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="border px-3 py-2">{t('common.cancel')}</button><button type="submit" className="bg-blue-600 px-3 py-2 text-white">{t('common.save')}</button></div>
      </form>
    </div>
  )
}

function getTextDisplayMode(section?: MetadataSectionConfig): MetadataTextDisplayMode {
  if (!section || section.type !== 'text') return 'free'
  if (section.textDisplayMode) return section.textDisplayMode
  return 'valueField' in section.mapping ? 'label_value' : 'free'
}

function getQueryDescription(query: MetadataQueryDefinition, language = 'ko'): string {
  if (language.startsWith('ko')) return query.descriptionKo || query.description || query.descriptionEn || ''
  return query.descriptionEn || query.description || query.descriptionKo || ''
}

function FieldSelect({ label, value, fields, onChange, allowEmpty = false }: { label: string; value: string; fields: MetadataQueryDefinition['resultSchema']; onChange: (value: string) => void; allowEmpty?: boolean }) {
  return <label className="block text-xs">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border px-2 py-1 dark:bg-slate-900">{allowEmpty ? <option value="">선택 안 함</option> : null}{fields.map((field) => <option key={field.name} value={field.name}>{field.label} ({field.name})</option>)}</select></label>
}
