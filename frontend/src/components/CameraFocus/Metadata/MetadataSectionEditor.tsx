import { useEffect, useState, type FormEvent } from 'react'
import type { MetadataChartMapping, MetadataGridMapping, MetadataQueryDefinition, MetadataSectionConfig, MetadataSectionType, MetadataTextDisplayMode, MetadataTextMapping } from '@/types/metadataConfig'

interface MetadataSectionEditorProps {
  section?: MetadataSectionConfig
  queries: MetadataQueryDefinition[]
  onSave: (section: MetadataSectionConfig) => void
  onClose: () => void
}

export function MetadataSectionEditor({ section, queries, onSave, onClose }: MetadataSectionEditorProps) {
  const [title, setTitle] = useState(section?.title ?? '')
  const [type, setType] = useState<MetadataSectionType>(section?.type ?? 'grid')
  const [textDisplayMode, setTextDisplayMode] = useState<MetadataTextDisplayMode>(getTextDisplayMode(section))
  const [queryId, setQueryId] = useState(section?.queryId ?? queries[0]?.queryId ?? '')
  const [defaultText, setDefaultText] = useState(section?.defaultText ?? '')
  const [interval, setInterval] = useState<5 | 10 | 30 | 60>(section?.refreshIntervalSec ?? 10)
  const [labelField, setLabelField] = useState('')
  const [valueField, setValueField] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [timeField, setTimeField] = useState('')
  const [seriesFields, setSeriesFields] = useState<string[]>([])

  const query = queries.find((item) => item.queryId === queryId)
  const fields = query?.resultSchema ?? []

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
        <div className="flex items-center justify-between"><h3 className="font-semibold">메타데이터 섹션 설정</h3><button type="button" onClick={onClose} aria-label="닫기">×</button></div>
        <label className="block text-sm">제목<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900" required /></label>
        <label className="block text-sm">표시 형식<select value={type} onChange={(event) => setType(event.target.value as MetadataSectionType)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900"><option value="text">텍스트</option><option value="grid">그리드</option><option value="chart">차트</option></select></label>
        <label className="block text-sm">Query ID{type === 'text' ? ' (선택)' : ''}<select value={queryId} onChange={(event) => setQueryId(event.target.value)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900">{type === 'text' ? <option value="">조회하지 않음</option> : null}{queries.map((item) => <option key={item.queryId} value={item.queryId}>{item.queryId}</option>)}</select></label>
        <label className="block text-sm">조회 주기<select value={interval} onChange={(event) => setInterval(Number(event.target.value) as 5 | 10 | 30 | 60)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900"><option value={5}>5초</option><option value={10}>10초</option><option value={30}>30초</option><option value={60}>60초</option></select></label>
        {type === 'text' ? <>
          <label className="block text-sm">텍스트 표시 형식<select value={textDisplayMode} onChange={(event) => setTextDisplayMode(event.target.value as MetadataTextDisplayMode)} className="mt-1 w-full border px-3 py-2 dark:bg-slate-900"><option value="free">자유 텍스트</option><option value="label_value">라벨-값</option></select></label>
          <label className="block text-sm">기본 텍스트<textarea value={defaultText} onChange={(event) => setDefaultText(event.target.value)} rows={3} placeholder="정적으로 표시할 텍스트 또는 조회 결과가 없을 때 표시할 안내 문구" className="mt-1 w-full resize-y border px-3 py-2 dark:bg-slate-900" /></label>
          {textDisplayMode === 'label_value' && query ? <div className="grid grid-cols-2 gap-2"><FieldSelect label="라벨 필드" value={labelField} fields={fields} onChange={setLabelField} /><FieldSelect label="값 필드" value={valueField} fields={fields} onChange={setValueField} /></div> : null}
          {textDisplayMode === 'label_value' && !query ? <p className="text-xs text-red-600">라벨-값 형식은 Query ID와 필드 매핑이 필요합니다.</p> : null}
        </> : null}
        {type === 'grid' ? <fieldset className="space-y-2"><legend className="text-sm">표시 컬럼</legend>{fields.map((field) => <label key={field.name} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selectedFields.includes(field.name)} onChange={(event) => setSelectedFields((current) => event.target.checked ? [...current, field.name] : current.filter((item) => item !== field.name))} />{field.label} ({field.name})</label>)}</fieldset> : null}
        {type === 'chart' ? <div className="space-y-2"><FieldSelect label="시간 필드" value={timeField} fields={fields} onChange={setTimeField} /><fieldset><legend className="text-sm">계열 필드</legend>{fields.filter((field) => field.name !== timeField).map((field) => <label key={field.name} className="mr-3 inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={seriesFields.includes(field.name)} onChange={(event) => setSeriesFields((current) => event.target.checked ? [...current, field.name] : current.filter((item) => item !== field.name))} />{field.label}</label>)}</fieldset></div> : null}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="border px-3 py-2">취소</button><button type="submit" className="bg-blue-600 px-3 py-2 text-white">저장</button></div>
      </form>
    </div>
  )
}

function getTextDisplayMode(section?: MetadataSectionConfig): MetadataTextDisplayMode {
  if (!section || section.type !== 'text') return 'free'
  if (section.textDisplayMode) return section.textDisplayMode
  return 'valueField' in section.mapping ? 'label_value' : 'free'
}

function FieldSelect({ label, value, fields, onChange, allowEmpty = false }: { label: string; value: string; fields: MetadataQueryDefinition['resultSchema']; onChange: (value: string) => void; allowEmpty?: boolean }) {
  return <label className="block text-xs">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border px-2 py-1 dark:bg-slate-900">{allowEmpty ? <option value="">선택 안 함</option> : null}{fields.map((field) => <option key={field.name} value={field.name}>{field.label} ({field.name})</option>)}</select></label>
}
