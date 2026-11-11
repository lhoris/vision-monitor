import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { alarmManagementService, type AlarmChannelPolicy, type AlarmManagementOverview, type AlarmTypePolicy } from '@/services/alarmManagementService'

const emptyChannel: AlarmChannelPolicy = { receiver: false, push: false, email: false, teams: false }

function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-blue-600 disabled:opacity-40" />
}

export default function AlarmManagement() {
  const { t } = useTranslation()
  const [data, setData] = useState<AlarmManagementOverview>({ types: [], users: [] })
  const [selectedCode, setSelectedCode] = useState('')
  const [draftTypes, setDraftTypes] = useState<Record<number, AlarmTypePolicy>>({})
  const [draftUsers, setDraftUsers] = useState<Record<number, Record<string, AlarmChannelPolicy>>>({})
  const [message, setMessage] = useState('')

  const load = async () => {
    const next = await alarmManagementService.get()
    setData(next)
    setSelectedCode((current) => current || next.types[0]?.code || '')
    setDraftTypes(Object.fromEntries(next.types.map((type) => [type.id, type])))
    setDraftUsers(Object.fromEntries(next.users.map((user) => [user.userId, user.overrides])))
  }
  useEffect(() => { void load() }, [])

  const selectedType = useMemo(() => data.types.find((type) => type.code === selectedCode), [data.types, selectedCode])
  const updateType = (id: number, patch: Partial<AlarmTypePolicy>) => setDraftTypes((current) => ({ ...current, [id]: { ...current[id], ...patch } }))
  const updateUser = (userId: number, patch: Partial<AlarmChannelPolicy>) => setDraftUsers((current) => ({
    ...current,
    [userId]: { ...current[userId], [selectedCode]: { ...emptyChannel, ...current[userId]?.[selectedCode], ...patch } },
  }))

  const saveType = async (type: AlarmTypePolicy) => {
    await alarmManagementService.updateType(type.id, {
      category: type.category, recipientScope: type.recipientScope, acknowledgementScope: type.acknowledgementScope,
      defaultSave: type.defaultSave, defaultReceive: type.defaultReceive, defaultPush: type.defaultPush,
      defaultEmail: type.defaultEmail, defaultTeams: type.defaultTeams,
    })
    setMessage(t('alarmManagement.messages.typeSaved'))
    await load()
  }
  const saveUser = async (userId: number) => {
    await alarmManagementService.updateUser(userId, draftUsers[userId] ?? {})
    setMessage(t('alarmManagement.messages.userSaved'))
    await load()
  }

  return <section className="flex h-full min-h-0 flex-col gap-4 overflow-auto bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t('navigation.admin.title')}</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('alarmManagement.title')}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('alarmManagement.description')}</p></header>
    {message ? <div role="status" className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}
    <section className="overflow-auto rounded border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700"><h2 className="font-semibold">{t('alarmManagement.typePolicy')}</h2></div>
      <table className="min-w-[1100px] w-full text-sm"><thead className="bg-slate-100 text-left dark:bg-slate-900"><tr>{['category','name','recipient','acknowledgement','save','push','email','teams','action'].map((key) => <th key={key} className="whitespace-nowrap px-3 py-2">{t(`alarmManagement.columns.${key}`)}</th>)}</tr></thead><tbody>
        {Object.values(draftTypes).map((type) => <tr key={type.id} className="border-t border-slate-200 dark:border-slate-700"><td className="px-3 py-2"><select value={type.category} onChange={(e) => updateType(type.id, { category: e.target.value as AlarmTypePolicy['category'] })} className="rounded border px-2 py-1"><option value="GENERAL">{t('alarmManagement.general')}</option><option value="MODEL">{t('alarmManagement.model')}</option></select></td><td className="px-3 py-2"><div className="font-medium">{type.nameKo || type.name}</div><div className="text-xs text-slate-500">{type.description}</div></td><td className="px-3 py-2"><select value={type.recipientScope} onChange={(e) => updateType(type.id, { recipientScope: e.target.value as AlarmTypePolicy['recipientScope'] })} className="rounded border px-2 py-1"><option value="ALL_ADMIN">{t('alarmManagement.allAdmins')}</option><option value="SELECTED_USER">{t('alarmManagement.selectedUsers')}</option></select></td><td className="px-3 py-2"><select value={type.acknowledgementScope} onChange={(e) => updateType(type.id, { acknowledgementScope: e.target.value as AlarmTypePolicy['acknowledgementScope'] })} className="rounded border px-2 py-1"><option value="GROUP">{t('alarmManagement.groupAck')}</option><option value="INDIVIDUAL">{t('alarmManagement.individualAck')}</option></select></td><td className="px-3 py-2"><Toggle checked={type.defaultSave} onChange={(value) => updateType(type.id, { defaultSave: value })} /></td><td className="px-3 py-2"><Toggle checked={type.defaultPush} onChange={(value) => updateType(type.id, { defaultPush: value })} /></td><td className="px-3 py-2"><Toggle checked={type.defaultEmail} onChange={(value) => updateType(type.id, { defaultEmail: value })} /></td><td className="px-3 py-2"><Toggle checked={type.defaultTeams} onChange={(value) => updateType(type.id, { defaultTeams: value })} /></td><td className="px-3 py-2"><button className="rounded bg-blue-600 px-3 py-1.5 text-white" onClick={() => void saveType(type)}>{t('common.save')}</button></td></tr>)}
      </tbody></table>
    </section>
    <section className="overflow-auto rounded border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700"><h2 className="font-semibold">{t('alarmManagement.userOverrides')}</h2><select value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)} className="rounded border px-3 py-1.5">{data.types.map((type) => <option key={type.code} value={type.code}>{type.nameKo || type.name}</option>)}</select></div>
      <p className="px-4 py-3 text-xs text-slate-500">{selectedType?.recipientScope === 'ALL_ADMIN' ? t('alarmManagement.allAdminsHint') : t('alarmManagement.selectedUsersHint')}</p>
      <table className="min-w-[760px] w-full text-sm"><thead className="bg-slate-100 text-left dark:bg-slate-900"><tr><th className="px-3 py-2">{t('alarmManagement.columns.user')}</th><th className="px-3 py-2">{t('alarmManagement.columns.receiver')}</th><th className="px-3 py-2">push</th><th className="px-3 py-2">{t('alarmManagement.channels.email')}</th><th className="px-3 py-2">Teams</th><th className="px-3 py-2">{t('alarmManagement.columns.action')}</th></tr></thead><tbody>{data.users.map((user) => { const rawValue = { ...emptyChannel, ...draftUsers[user.userId]?.[selectedCode] }; const value = { ...rawValue, receiver: selectedType?.recipientScope === 'ALL_ADMIN' ? true : rawValue.receiver }; return <tr key={user.userId} className="border-t border-slate-200 dark:border-slate-700"><td className="px-3 py-2">{user.name} <span className="text-xs text-slate-500">({user.username})</span></td><td className="px-3 py-2"><Toggle checked={value.receiver} onChange={(checked) => updateUser(user.userId, { receiver: checked })} disabled={selectedType?.recipientScope !== 'SELECTED_USER'} /></td><td className="px-3 py-2"><Toggle checked={value.push} onChange={(checked) => updateUser(user.userId, { push: checked })} /></td><td className="px-3 py-2"><Toggle checked={value.email} onChange={(checked) => updateUser(user.userId, { email: checked })} /></td><td className="px-3 py-2"><Toggle checked={value.teams} onChange={(checked) => updateUser(user.userId, { teams: checked })} /></td><td className="px-3 py-2"><button className="rounded bg-blue-600 px-3 py-1.5 text-white" onClick={() => void saveUser(user.userId)}>{t('common.save')}</button></td></tr> })}</tbody></table>
    </section>
  </section>
}
