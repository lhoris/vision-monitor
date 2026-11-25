import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog, DataGridActionButton, DataGridTable, DataGridToolbar, Toast } from '@/components/Common'
import { useDataGridSelection } from '@/hooks/useDataGridSelection'
import { alarmManagementService, type AlarmChannelPolicy, type AlarmManagementOverview, type AlarmTypePolicy } from '@/services/alarmManagementService'

type PendingAction = { scope: 'type' | 'user'; ids: number[] } | null
type PendingSave = 'type' | 'user' | null
type RecipientDraft = { rowId: number; userId: number | '' }
const emptyChannel: AlarmChannelPolicy = { receiver: false, push: false, email: false, teams: false }
const headerCell = 'h-8 border-b border-r border-[#9dcced] bg-[#dff2ff] px-2 text-center text-xs font-semibold text-[#266b9f] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-100'
const bodyCell = 'h-9 border-b border-r border-[#b7d8ee] p-0 align-middle dark:border-slate-700'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-blue-600" />
}

export default function AlarmManagement() {
  const { t } = useTranslation()
  const [data, setData] = useState<AlarmManagementOverview>({ types: [], users: [] })
  const [selectedCode, setSelectedCode] = useState('')
  const [draftTypes, setDraftTypes] = useState<Record<number, AlarmTypePolicy>>({})
  const [draftUsers, setDraftUsers] = useState<Record<number, Record<string, AlarmChannelPolicy>>>({})
  const [dirtyTypes, setDirtyTypes] = useState<Set<number>>(new Set())
  const [dirtyUsers, setDirtyUsers] = useState<Set<number>>(new Set())
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [pendingSave, setPendingSave] = useState<PendingSave>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [recipientDrafts, setRecipientDrafts] = useState<RecipientDraft[]>([])

  const typeSelection = useDataGridSelection(Object.values(draftTypes).map((type) => type.id))
  const recipientRows = [
    ...data.users
      .filter((user) => draftUsers[user.userId]?.[selectedCode]?.receiver)
      .filter((user) => !recipientDrafts.some((draft) => draft.userId === user.userId)),
    ...recipientDrafts,
  ]
  const userSelection = useDataGridSelection(recipientRows.map((row) => 'rowId' in row ? row.rowId : row.userId))

  const loadTypes = async (showNotice = false) => {
    setBusy(true)
    try {
      const types = await alarmManagementService.getTypes()
      setData((current) => ({ ...current, types }))
      setSelectedCode((current) => types.some((type) => type.code === current) ? current : types[0]?.code || '')
      setDraftTypes(Object.fromEntries(types.map((type) => [type.id, type])))
      setDirtyTypes(new Set())
      typeSelection.clear()
      if (showNotice) setNotice(t('alarmManagement.messages.loaded'))
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : t('alarmManagement.messages.loadError'))
    } finally {
      setBusy(false)
    }
  }

  const loadUsers = async (showNotice = false) => {
    setBusy(true)
    try {
      const selectedRuleId = data.types.find((type) => type.code === selectedCode)?.id
      const users = await alarmManagementService.getUsers(selectedRuleId && selectedRuleId > 0 ? selectedRuleId : undefined)
      setData((current) => ({ ...current, users }))
      setDraftUsers(Object.fromEntries(users.map((user) => [user.userId, user.overrides])))
      setDirtyUsers(new Set())
      setRecipientDrafts([])
      userSelection.clear()
      if (showNotice) setNotice(t('alarmManagement.messages.recipientsLoaded'))
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : t('alarmManagement.messages.loadError'))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { void Promise.all([loadTypes(), loadUsers()]) }, [])
  useEffect(() => {
    if (selectedCode) void loadUsers(true)
  }, [selectedCode])
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 3000); return () => window.clearTimeout(timer) }, [notice])

  const selectedType = data.types.find((type) => type.code === selectedCode)
  const updateType = (id: number, patch: Partial<AlarmTypePolicy>) => {
    setDraftTypes((current) => ({ ...current, [id]: { ...current[id], ...patch } }))
    setDirtyTypes((current) => new Set(current).add(id))
  }
  const updateUser = (userId: number, patch: Partial<AlarmChannelPolicy>) => {
    setDraftUsers((current) => ({ ...current, [userId]: { ...current[userId], [selectedCode]: { ...emptyChannel, ...current[userId]?.[selectedCode], ...patch } } }))
    setDirtyUsers((current) => new Set(current).add(userId))
    userSelection.select(userId)
  }

  const addType = () => {
    const id = -Date.now()
    const row: AlarmTypePolicy = { id, code: `NEW_ALARM_${Math.abs(id)}`, name: '', nameKo: '', nameEn: '', description: '', category: 'GENERAL', acknowledgementScope: 'INDIVIDUAL' }
    setDraftTypes((current) => ({ [id]: row, ...current }))
    setDirtyTypes((current) => new Set(current).add(id))
    typeSelection.select(id)
    setSelectedCode(row.code)
  }

  const deleteDraftTypes = () => {
    const ids = new Set([...typeSelection.selectedIds].filter((id) => id < 0))
    if (!ids.size) return
    setDraftTypes((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(Number(id)))))
    setDirtyTypes((current) => new Set([...current].filter((id) => !ids.has(id))))
    typeSelection.clear()
    if (ids.has(Object.values(draftTypes).find((type) => type.code === selectedCode)?.id ?? 0)) setSelectedCode('')
  }

  const addRecipient = () => setRecipientDrafts((current) => [...current, { rowId: -Date.now(), userId: '' }])

  const deleteDraftRecipients = () => {
    const ids = new Set(recipientDrafts.filter((draft) => userSelection.selectedIds.has(draft.rowId)).map((draft) => draft.rowId))
    if (!ids.size) return
    setRecipientDrafts((current) => current.filter((draft) => !ids.has(draft.rowId)))
    userSelection.clear()
  }

  const updateRecipientDraft = (rowId: number, userId: number | '') => {
    setRecipientDrafts((current) => current.map((draft) => draft.rowId === rowId ? { ...draft, userId } : draft))
    if (userId !== '') updateUser(userId, { receiver: true })
  }

  const selectType = (code: string) => {
    setSelectedCode(code)
    const row = Object.values(draftTypes).find((type) => type.code === code)
    typeSelection.selectMany(row ? [row.id] : [])
  }

  const saveTypes = async () => {
    const rows = [...dirtyTypes].map((id) => draftTypes[id]).filter(Boolean)
    if (!rows.length) return
    setBusy(true)
    try {
      await Promise.all(rows.map((type) => type.id < 0
        ? alarmManagementService.createType({ code: type.code, name: type.name, nameKo: type.nameKo, nameEn: type.nameEn, description: type.description, category: type.category, acknowledgementScope: type.acknowledgementScope })
        : alarmManagementService.updateType(type.id, { name: type.name, nameKo: type.nameKo, nameEn: type.nameEn, description: type.description, category: type.category, acknowledgementScope: type.acknowledgementScope })))
      setNotice(t('alarmManagement.messages.typeSaved'))
      await loadTypes()
    } catch (exception) { setError(exception instanceof Error ? exception.message : t('alarmManagement.messages.saveError')) } finally { setBusy(false) }
  }

  const saveUsers = async () => {
    const rows = [...dirtyUsers]
    if (!rows.length) return
    setBusy(true)
    try {
      await Promise.all(rows.map((id) => alarmManagementService.updateUser(id, draftUsers[id] ?? {})))
      setNotice(t('alarmManagement.messages.userSaved'))
      await loadUsers()
    } catch (exception) { setError(exception instanceof Error ? exception.message : t('alarmManagement.messages.saveError')) } finally { setBusy(false) }
  }

  const confirmSave = async () => {
    const scope = pendingSave
    setPendingSave(null)
    if (scope === 'type') await saveTypes()
    if (scope === 'user') await saveUsers()
  }

  const confirmDelete = async () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    setBusy(true)
    try {
      if (action.scope === 'type') {
        await Promise.all(action.ids.map((id) => alarmManagementService.deactivateType(id)))
        setNotice(t('alarmManagement.messages.typeDeleted'))
      } else if (selectedCode) {
        await Promise.all(action.ids.map((id) => alarmManagementService.updateUser(id, { ...draftUsers[id], [selectedCode]: emptyChannel })))
        setNotice(t('alarmManagement.messages.userDeleted'))
      }
      if (action.scope === 'type') await loadTypes()
      else await loadUsers()
    } catch (exception) { setError(exception instanceof Error ? exception.message : t('alarmManagement.messages.deleteError')) } finally { setBusy(false) }
  }

  const selectedTypeRows = Object.values(draftTypes).filter((type) => typeSelection.selectedIds.has(type.id))
  const selectedUserRows = data.users.filter((user) => userSelection.selectedIds.has(user.userId))
  const selectedRecipientCount = selectedUserRows.length + recipientDrafts.filter((draft) => userSelection.selectedIds.has(draft.rowId)).length
  const requestTypeDelete = () => {
    deleteDraftTypes()
    const ids = selectedTypeRows.filter((type) => type.id > 0).map((type) => type.id)
    if (ids.length) setPendingAction({ scope: 'type', ids })
  }
  const requestUserDelete = () => {
    const draftIds = new Set(recipientDrafts.filter((draft) => userSelection.selectedIds.has(draft.rowId)).map((draft) => draft.rowId))
    if (draftIds.size) {
      setRecipientDrafts((current) => current.filter((draft) => !draftIds.has(draft.rowId)))
      userSelection.clear()
    }
    if (selectedUserRows.length) setPendingAction({ scope: 'user', ids: selectedUserRows.map((user) => user.userId) })
  }

  return <section data-alarm-management className="flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
    <style>{`[data-alarm-management] select { color: #0f172a; } [data-alarm-management] select option { color: #0f172a; background: #ffffff; } .dark [data-alarm-management] select { color: #f1f5f9; background-color: #1e293b; } .dark [data-alarm-management] select option { color: #f1f5f9; background: #1e293b; } [data-alarm-management] > .grid > section:first-child th:first-child, [data-alarm-management] > .grid > section:first-child td:first-child { display: none; } [data-alarm-management] button:disabled { cursor: not-allowed; opacity: 0.5; }`}</style>
    <header className="shrink-0"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t('navigation.admin.title')}</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('alarmManagement.title')}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('alarmManagement.description')}</p></header>
    <Toast message={notice} variant="success" onClose={() => setNotice('')} /><Toast message={error} variant="error" onClose={() => setError('')} />
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(460px,1.2fr)_minmax(560px,1fr)]">
      <section className="relative flex min-h-0 flex-col border border-[#9dcced] bg-white dark:border-slate-700 dark:bg-slate-800">
        <DataGridToolbar><span className="min-w-0 flex-1 truncate font-semibold">{t('alarmManagement.master')}</span><DataGridActionButton onClick={() => void loadTypes(true)} disabled={busy}>조회</DataGridActionButton><DataGridActionButton variant="primary" onClick={() => setPendingSave('type')} disabled={!dirtyTypes.size || busy}>저장</DataGridActionButton><DataGridActionButton variant="danger" onClick={requestTypeDelete} disabled={!selectedTypeRows.length || busy}>삭제</DataGridActionButton></DataGridToolbar>
        <div className="min-h-0 flex-1 overflow-auto"><DataGridTable className="w-full min-w-[860px] border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm"><thead className="sticky top-0 z-10"><tr><th className={`w-10 ${headerCell}`}><input aria-label={t('alarmManagement.selectAllTypes')} type="checkbox" checked={typeSelection.allVisibleSelected} onChange={typeSelection.toggleVisible} /></th><th className={`w-40 ${headerCell}`}>{t('alarmManagement.columns.code')}</th><th className={`w-48 ${headerCell}`}>{t('alarmManagement.columns.alarmName')}</th><th className={`w-56 ${headerCell}`}>{t('alarmManagement.columns.description')}</th><th className={`w-36 ${headerCell}`}>{t('alarmManagement.columns.acknowledgement')}</th><th className={`w-28 ${headerCell}`}>{t('alarmManagement.columns.category')}</th></tr></thead><tbody>{Object.values(draftTypes).map((type) => <tr key={type.id} aria-selected={selectedCode === type.code} onClickCapture={() => selectType(type.code)} onClick={() => selectType(type.code)} className={`h-9 cursor-pointer text-slate-800 dark:text-slate-100 ${selectedCode === type.code ? 'bg-[#d6edff] shadow-[inset_4px_0_0_#2563eb] dark:bg-sky-950/40' : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50'}`}><td className={`${bodyCell} text-center`}><input aria-label={`${type.nameKo || type.name} 선택`} type="checkbox" checked={typeSelection.selectedIds.has(type.id)} onClick={(event) => event.stopPropagation()} onChange={() => typeSelection.toggle(type.id)} /></td><td className="border-b border-r border-[#b7d8ee] px-2 dark:border-slate-700" onClick={(event) => event.stopPropagation()}>{type.id < 0 ? <input value={type.code} onChange={(event) => updateType(type.id, { code: event.target.value })} className="h-8 w-full border border-slate-300 px-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-900" /> : <span className="font-mono text-xs">{type.code}</span>}</td><td className="px-2 py-1" onClick={(event) => event.stopPropagation()}><input value={type.nameKo || type.name} onChange={(event) => updateType(type.id, { name: event.target.value, nameKo: event.target.value })} placeholder={t('alarmManagement.newTypeName')} className="h-8 w-full border border-slate-300 px-2 text-sm dark:border-slate-600 dark:bg-slate-900" /></td><td className="border-b border-r border-[#b7d8ee] px-2 dark:border-slate-700" onClick={(event) => event.stopPropagation()}><input value={type.description || ''} onChange={(event) => updateType(type.id, { description: event.target.value })} placeholder={t('alarmManagement.descriptionPlaceholder')} className="h-8 w-full border border-slate-300 px-2 text-sm dark:border-slate-600 dark:bg-slate-900" /></td><td className={bodyCell} onClick={(event) => event.stopPropagation()}><select value={type.acknowledgementScope} onChange={(event) => updateType(type.id, { acknowledgementScope: event.target.value as AlarmTypePolicy['acknowledgementScope'] })} className="h-9 w-full border-0 bg-transparent px-2 text-sm outline-none"><option value="GROUP">{t('alarmManagement.groupAck')}</option><option value="INDIVIDUAL">{t('alarmManagement.individualAck')}</option></select></td><td className={bodyCell} onClick={(event) => event.stopPropagation()}><select value={type.category} onChange={(event) => updateType(type.id, { category: event.target.value as AlarmTypePolicy['category'] })} className="h-9 w-full border-0 bg-transparent px-2 text-sm outline-none"><option value="GENERAL">{t('alarmManagement.general')}</option><option value="MODEL">{t('alarmManagement.model')}</option></select></td></tr>)}</tbody></DataGridTable></div>
        <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"><button type="button" onClick={addType} disabled={busy} className="rounded border border-slate-300 px-2 py-1">행 추가</button><button type="button" onClick={deleteDraftTypes} disabled={busy || !selectedTypeRows.some((type) => type.id < 0)} className="rounded border border-rose-300 px-2 py-1 text-rose-700">행 삭제</button><button type="button" onClick={() => void loadTypes(true)} disabled={busy} className="rounded border border-slate-300 px-2 py-1">새로고침</button><span className="ml-auto">선택 {typeSelection.selectedIds.size}건 | 전체 {Object.keys(draftTypes).length}건 | 변경 {dirtyTypes.size}건</span></div>
      </section>
      <section className="relative flex min-h-0 flex-col border border-[#9dcced] bg-white dark:border-slate-700 dark:bg-slate-800">
        <DataGridToolbar><span className="min-w-0 flex-1 truncate font-semibold">{t('alarmManagement.detail')}{selectedType ? ` - ${selectedType.nameKo || selectedType.name}` : ''}</span><DataGridActionButton onClick={() => void loadUsers(true)} disabled={busy}>조회</DataGridActionButton><DataGridActionButton variant="primary" onClick={() => setPendingSave('user')} disabled={!dirtyUsers.size || busy}>저장</DataGridActionButton><DataGridActionButton variant="danger" onClick={requestUserDelete} disabled={!selectedRecipientCount || busy}>삭제</DataGridActionButton></DataGridToolbar>
        <div className="min-h-0 flex-1 overflow-auto"><DataGridTable className="w-full min-w-[760px] border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm"><thead className="sticky top-0 z-10"><tr><th className={`w-10 ${headerCell}`}><input aria-label={t('alarmManagement.selectAllUsers')} type="checkbox" checked={userSelection.allVisibleSelected} onChange={userSelection.toggleVisible} /></th><th className={`w-48 ${headerCell}`}>{t('alarmManagement.columns.user')}</th><th className={`w-24 ${headerCell}`}>{t('alarmManagement.columns.appPush')}</th><th className={`w-20 ${headerCell}`}>{t('alarmManagement.columns.email')}</th><th className={`w-28 ${headerCell}`}>{t('alarmManagement.columns.teamsBot')}</th></tr></thead><tbody>{recipientRows.map((row) => { const isDraft = 'rowId' in row; const rowId = isDraft ? row.rowId : row.userId; const user = isDraft ? data.users.find((item) => item.userId === row.userId) : row; const value = user ? { ...emptyChannel, ...draftUsers[user.userId]?.[selectedCode] } : emptyChannel; return <tr key={rowId} className="h-9 bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100"><td className={`${bodyCell} text-center`}><input aria-label={`${user?.name || t('alarmManagement.newRecipient')} 선택`} type="checkbox" checked={userSelection.selectedIds.has(rowId)} onChange={() => userSelection.toggle(rowId)} /></td><td className="border-b border-r border-[#b7d8ee] px-2 dark:border-slate-700">{isDraft ? <select value={row.userId} onChange={(event) => updateRecipientDraft(row.rowId, event.target.value ? Number(event.target.value) : '')} className="h-8 w-full border border-slate-300 px-2 text-sm dark:border-slate-600 dark:bg-slate-900"><option value="">{t('alarmManagement.selectRecipient')}</option>{data.users.filter((item) => !draftUsers[item.userId]?.[selectedCode]?.receiver && !recipientDrafts.some((draft) => draft.userId === item.userId)).map((item) => <option key={item.userId} value={item.userId}>{item.name} ({item.username})</option>)}</select> : <>{user?.name} <span className="text-xs text-slate-500">({user?.username})</span></>}</td><td className={`${bodyCell} text-center`}><Toggle checked={value.push} onChange={(checked) => user && updateUser(user.userId, { push: checked })} /></td><td className={`${bodyCell} text-center`}><Toggle checked={value.email} onChange={(checked) => user && updateUser(user.userId, { email: checked })} /></td><td className={`${bodyCell} text-center`}><Toggle checked={value.teams} onChange={(checked) => user && updateUser(user.userId, { teams: checked })} /></td></tr> })}</tbody></DataGridTable></div>
        <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"><button type="button" onClick={addRecipient} disabled={!selectedType || busy} className="rounded border border-slate-300 px-2 py-1">행 추가</button><button type="button" onClick={deleteDraftRecipients} disabled={busy || !recipientDrafts.some((draft) => userSelection.selectedIds.has(draft.rowId))} className="rounded border border-rose-300 px-2 py-1 text-rose-700">행 삭제</button><button type="button" onClick={() => void loadUsers(true)} disabled={busy} className="rounded border border-slate-300 px-2 py-1">새로고침</button><span className="ml-auto">선택 {userSelection.selectedIds.size}건 | 전체 {recipientRows.length}건 | 변경 {dirtyUsers.size}건</span></div>
      </section>
    </div>
    <ConfirmDialog isOpen={Boolean(pendingSave)} title={t('alarmManagement.confirmSaveTitle')} message={pendingSave === 'type' ? t('alarmManagement.confirmSaveType') : t('alarmManagement.confirmSaveUser')} confirmLabel={t('common.confirm')} cancelLabel={t('common.cancel')} busy={busy} onCancel={() => { if (!busy) setPendingSave(null) }} onConfirm={() => void confirmSave()} />
    <ConfirmDialog isOpen={Boolean(pendingAction)} title={t('alarmManagement.confirmDeleteTitle')} message={pendingAction?.scope === 'type' ? t('alarmManagement.confirmDeleteType') : t('alarmManagement.confirmDeleteUser')} confirmLabel={t('common.delete')} cancelLabel={t('common.cancel')} variant="danger" busy={busy} onCancel={() => { if (!busy) setPendingAction(null) }} onConfirm={() => void confirmDelete()} />
  </section>
}
