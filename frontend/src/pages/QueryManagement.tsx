import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog, DataGridActionButton, DataGridToolbar, Toast } from '@/components/Common'
import { QueryEditorDialog } from '@/components/QueryManagement/QueryEditorDialog'
import { QueryGrid } from '@/components/QueryManagement/QueryGrid'
import { metadataManagementService } from '@/services/metadataManagementService'
import { useDataGridSelection } from '@/hooks/useDataGridSelection'
import type { MetadataQueryAdmin, MetadataQueryAdminInput, MetadataQueryStatusFilter } from '@/types/metadataManagement'

function messageOf(error: unknown, fallback: string) { return typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' ? error.message : fallback }

export default function QueryManagement() {
  const { t } = useTranslation()
  const [queries, setQueries] = useState<MetadataQueryAdmin[]>([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<MetadataQueryStatusFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editor, setEditor] = useState<MetadataQueryAdmin | null | undefined>(undefined)
  const [confirm, setConfirm] = useState<MetadataQueryAdmin | null>(null)
  const selection = useDataGridSelection(queries.map((query) => query.id))
  const selectedQueries = queries.filter((query) => selection.selectedIds.has(query.id))

  const load = async (showNotice = false) => {
    setLoading(true)
    try { setQueries(await metadataManagementService.list(keyword, status)); selection.clear(); setError(''); if (showNotice) setNotice(t('queryManagement.searchCompleted')) }
    catch (loadError) { setError(messageOf(loadError, t('queryManagement.loadError'))) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [status])
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 3000); return () => window.clearTimeout(timer) }, [notice])

  const save = async (input: MetadataQueryAdminInput) => {
    setBusy(true)
    try {
      if (editor && editor.id > 0) await metadataManagementService.update(editor.queryCode, input)
      else await metadataManagementService.create(input)
      setEditor(undefined); setNotice(t('queryManagement.saveCompleted')); await load()
    } catch (saveError) { setError(messageOf(saveError, t('queryManagement.saveError'))) }
    finally { setBusy(false) }
  }
  const duplicateQuery = () => {
    if (selectedQueries.length !== 1) return
    const source = selectedQueries[0]
    const draft = { ...source, id: -Date.now(), queryCode: `${source.queryCode}_COPY`, queryName: `${source.queryName} 복사본`, deleted: false, enabled: true, referenceCount: 0, updatedAt: new Date().toISOString() }
    setQueries((current) => [draft, ...current])
    selection.clear()
    selection.select(draft.id)
    setEditor(draft)
  }
  const deleteDrafts = () => {
    const ids = new Set(selectedQueries.filter((query) => query.id < 0).map((query) => query.id))
    if (!ids.size) return
    setQueries((current) => current.filter((query) => !ids.has(query.id))); selection.clear(); setNotice(t('queryManagement.draftDeleted', { count: ids.size }))
  }
  const requestDelete = () => { const query = selectedQueries.find((item) => item.id > 0); if (query) setConfirm(query) }
  const confirmDelete = async () => {
    if (!confirm) return
    setBusy(true)
    try { await metadataManagementService.remove(confirm.queryCode); setConfirm(null); setNotice(t('queryManagement.deleteCompleted')); await load() }
    catch (actionError) { setError(messageOf(actionError, t('queryManagement.actionError'))) }
    finally { setBusy(false) }
  }

  return <section className="flex h-full min-h-0 flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t('navigation.admin.title')}</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('queryManagement.title')}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('queryManagement.subtitle')}</p></header>
    <Toast message={notice} variant="success" onClose={() => setNotice('')} />
    <DataGridToolbar><label className="min-w-[260px] flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{t('queryManagement.search')}<input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void load(true) }} placeholder={t('queryManagement.searchPlaceholder')} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm font-normal dark:border-slate-600 dark:bg-slate-800" /></label><label className="w-36 text-xs font-semibold text-slate-600 dark:text-slate-300">{t('queryManagement.status')}<select value={status} onChange={(event) => setStatus(event.target.value as MetadataQueryStatusFilter)} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm font-normal dark:border-slate-600 dark:bg-slate-800"><option value="ALL">{t('queryManagement.all')}</option><option value="ACTIVE">{t('queryManagement.active')}</option><option value="INACTIVE">{t('queryManagement.inactive')}</option><option value="DELETED">{t('queryManagement.deleted')}</option></select></label><DataGridActionButton onClick={() => void load(true)}>조회</DataGridActionButton><DataGridActionButton variant="danger" onClick={requestDelete} disabled={!selectedQueries.some((query) => query.id > 0) || busy}>{t('queryManagement.delete')}</DataGridActionButton></DataGridToolbar>
    {error ? <div role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
    {loading ? <div className="flex flex-1 items-center justify-center text-sm text-slate-500">{t('queryManagement.loading')}</div> : <QueryGrid queries={queries} selectedIds={selection.selectedIds} allSelected={selection.allVisibleSelected} onToggleAll={selection.toggleVisible} onToggle={selection.toggle} onEdit={(query) => setEditor(query)} />}
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"><button type="button" onClick={() => setEditor(null)} disabled={busy} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-50">행 추가</button><button type="button" onClick={duplicateQuery} disabled={selectedQueries.length !== 1 || busy} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-50">행 복제</button><button type="button" onClick={deleteDrafts} disabled={!selectedQueries.some((query) => query.id < 0) || busy} className="rounded border border-rose-300 px-2 py-1 font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">행 삭제</button><button type="button" onClick={() => void load(true)} disabled={busy} className="rounded border border-slate-300 px-2 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-50">새로고침</button><span className="ml-auto">선택 {selectedQueries.length}건 | 전체 {queries.length}건</span></div>
    {editor !== undefined ? <QueryEditorDialog query={editor} busy={busy} onClose={() => setEditor(undefined)} onSave={save} /> : null}
    <ConfirmDialog isOpen={Boolean(confirm)} busy={busy} variant="danger" title={t('queryManagement.deleteTitle')} message={t('queryManagement.confirmDelete')} confirmLabel={t('common.confirm', 'Confirm')} cancelLabel={t('common.cancel')} onCancel={() => setConfirm(null)} onConfirm={confirmDelete} />
  </section>
}
