import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/Common'
import { QueryEditorDialog } from '@/components/QueryManagement/QueryEditorDialog'
import { QueryGrid } from '@/components/QueryManagement/QueryGrid'
import { metadataManagementService } from '@/services/metadataManagementService'
import type { MetadataQueryAdmin, MetadataQueryAdminInput, MetadataQueryStatusFilter } from '@/types/metadataManagement'

function messageOf(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') return error.message
  return fallback
}

export default function QueryManagement() {
  const { t } = useTranslation()
  const [queries, setQueries] = useState<MetadataQueryAdmin[]>([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<MetadataQueryStatusFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<MetadataQueryAdmin | null | undefined>(undefined)
  const [confirm, setConfirm] = useState<{ type: 'toggle' | 'delete'; query: MetadataQueryAdmin } | null>(null)

  const load = async () => {
    setLoading(true)
    try { setQueries(await metadataManagementService.list(keyword, status)); setError('') }
    catch (loadError) { setError(messageOf(loadError, t('queryManagement.loadError'))) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [status])

  const save = async (input: MetadataQueryAdminInput) => {
    setBusy(true)
    try {
      if (editor) await metadataManagementService.update(editor.queryCode, input)
      else await metadataManagementService.create(input)
      setEditor(undefined)
      await load()
    } catch (saveError) { setError(messageOf(saveError, t('queryManagement.saveError'))) }
    finally { setBusy(false) }
  }

  const confirmAction = async () => {
    if (!confirm) return
    setBusy(true)
    try {
      if (confirm.type === 'delete') await metadataManagementService.remove(confirm.query.queryCode)
      else await metadataManagementService.setEnabled(confirm.query.queryCode, !confirm.query.enabled)
      setConfirm(null)
      await load()
    } catch (actionError) { setError(messageOf(actionError, t('queryManagement.actionError'))) }
    finally { setBusy(false) }
  }

  return <section className="flex h-full min-h-0 flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t('navigation.admin.title')}</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('queryManagement.title')}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('queryManagement.subtitle')}</p></div><button type="button" onClick={() => setEditor(null)} className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{t('queryManagement.add')}</button></header>
    <section className="flex flex-wrap items-end gap-3 border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><label className="min-w-[260px] flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{t('queryManagement.search')}<input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void load() }} placeholder={t('queryManagement.searchPlaceholder')} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm font-normal dark:border-slate-600 dark:bg-slate-800" /></label><label className="w-36 text-xs font-semibold text-slate-600 dark:text-slate-300">{t('queryManagement.status')}<select value={status} onChange={(event) => setStatus(event.target.value as MetadataQueryStatusFilter)} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm font-normal dark:border-slate-600 dark:bg-slate-800"><option value="ALL">{t('queryManagement.all')}</option><option value="ACTIVE">{t('queryManagement.active')}</option><option value="INACTIVE">{t('queryManagement.inactive')}</option><option value="DELETED">{t('queryManagement.deleted')}</option></select></label><button type="button" onClick={() => void load()} className="border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-600 dark:text-slate-200">{t('common.search', 'Search')}</button></section>
    {error ? <div role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
    {loading ? <div className="flex flex-1 items-center justify-center text-sm text-slate-500">{t('queryManagement.loading')}</div> : <QueryGrid queries={queries} onEdit={(query) => setEditor(query)} onToggle={(query) => setConfirm({ type: 'toggle', query })} onDelete={(query) => setConfirm({ type: 'delete', query })} />}
    {editor !== undefined ? <QueryEditorDialog query={editor} busy={busy} onClose={() => setEditor(undefined)} onSave={save} /> : null}
    <ConfirmDialog isOpen={Boolean(confirm)} busy={busy} variant={confirm?.type === 'delete' ? 'danger' : 'default'} title={confirm?.type === 'delete' ? t('queryManagement.deleteTitle') : t('queryManagement.toggleTitle')} message={confirm?.type === 'delete' ? t('queryManagement.confirmDelete') : t('queryManagement.confirmToggle')} confirmLabel={t('common.confirm', 'Confirm')} cancelLabel={t('common.cancel')} onCancel={() => setConfirm(null)} onConfirm={confirmAction} />
  </section>
}
