import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetadataQueryAdmin, MetadataQueryAdminInput } from '@/types/metadataManagement'

interface Props {
  query?: MetadataQueryAdmin | null
  busy?: boolean
  onClose: () => void
  onSave: (input: MetadataQueryAdminInput) => Promise<void>
}

const emptyInput: MetadataQueryAdminInput = {
  queryCode: '', queryName: '', queryDescription: '', sqlText: '', parameterSchema: '', resultSchema: '', queryTimeoutSec: 5, useStatus: 'Y',
}

export function QueryEditorDialog({ query, busy = false, onClose, onSave }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<MetadataQueryAdminInput>(query ? {
    queryCode: query.queryCode, queryName: query.queryName, queryDescription: query.queryDescription ?? '', sqlText: query.sqlText,
    parameterSchema: query.parameterSchema ?? '', resultSchema: query.resultSchema ?? '', queryTimeoutSec: query.queryTimeoutSec, useStatus: query.enabled ? 'Y' : 'N',
  } : emptyInput)
  const [error, setError] = useState('')
  const update = <K extends keyof MetadataQueryAdminInput>(key: K, value: MetadataQueryAdminInput[K]) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async () => {
    if (!form.queryCode.trim() || !form.queryName.trim() || !form.sqlText.trim()) { setError('Query ID, Query 명칭, SQL은 필수입니다.'); return }
    if (!/^[-A-Za-z0-9._]+$/.test(form.queryCode.trim())) { setError('Query ID 형식이 올바르지 않습니다.'); return }
    setError('')
    await onSave({ ...form, queryCode: form.queryCode.trim(), queryName: form.queryName.trim(), queryTimeoutSec: Number(form.queryTimeoutSec) })
  }
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
    <section role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-3xl overflow-auto border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{query ? t('queryManagement.edit') : t('queryManagement.add')}</h2><p className="mt-1 text-sm text-slate-500">{t('queryManagement.subtitle')}</p></div><button type="button" aria-label={t('common.close')} onClick={onClose} className="text-2xl text-slate-400">×</button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Query ID<input disabled={Boolean(query)} value={form.queryCode} onChange={(event) => update('queryCode', event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-mono font-normal dark:border-slate-600 dark:bg-slate-800" placeholder="camera.status" /></label>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Query 명칭<input value={form.queryName} onChange={(event) => update('queryName', event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 md:col-span-2">설명<input value={form.queryDescription} onChange={(event) => update('queryDescription', event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 md:col-span-2">조회 SQL<textarea value={form.sqlText} onChange={(event) => update('sqlText', event.target.value)} rows={8} className="mt-1 w-full border border-slate-300 px-3 py-2 font-mono text-sm font-normal dark:border-slate-600 dark:bg-slate-800" placeholder="SELECT ... WHERE VIDEO_SOURCE_ID = :sourceId" /></label>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">파라미터 정의(JSON)<textarea value={form.parameterSchema} onChange={(event) => update('parameterSchema', event.target.value)} rows={4} className="mt-1 w-full border border-slate-300 px-3 py-2 font-mono text-sm font-normal dark:border-slate-600 dark:bg-slate-800" placeholder="[{&quot;name&quot;:&quot;sourceId&quot;}]" /></label>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">결과 Schema(JSON)<textarea value={form.resultSchema} onChange={(event) => update('resultSchema', event.target.value)} rows={4} className="mt-1 w-full border border-slate-300 px-3 py-2 font-mono text-sm font-normal dark:border-slate-600 dark:bg-slate-800" placeholder="[{&quot;name&quot;:&quot;status&quot;,&quot;type&quot;:&quot;string&quot;}]" /></label>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">제한시간(초)<input type="number" min={1} max={60} value={form.queryTimeoutSec} onChange={(event) => update('queryTimeoutSec', Number(event.target.value))} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">사용 여부<select value={form.useStatus} onChange={(event) => update('useStatus', event.target.value as 'Y' | 'N')} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal dark:border-slate-600 dark:bg-slate-800"><option value="Y">활성</option><option value="N">비활성</option></select></label>
      </div>
      {error ? <p role="alert" className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200">{t('queryManagement.cancel')}</button><button type="button" disabled={busy} onClick={() => void submit()} className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? t('common.loading') : t('queryManagement.save')}</button></div>
    </section>
  </div>
}
