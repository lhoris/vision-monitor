import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  alarmManagementService,
  type AlarmChannelPolicy,
  type AlarmManagementOverview,
  type AlarmTypePolicy,
} from '@/services/alarmManagementService'

const emptyChannel: AlarmChannelPolicy = { receiver: false, push: false, email: false, teams: false }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 accent-blue-600"
    />
  )
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

  useEffect(() => {
    void load()
  }, [])

  const selectedType = data.types.find((type) => type.code === selectedCode)
  const updateType = (id: number, patch: Partial<AlarmTypePolicy>) =>
    setDraftTypes((current) => ({ ...current, [id]: { ...current[id], ...patch } }))
  const updateUser = (userId: number, patch: Partial<AlarmChannelPolicy>) =>
    setDraftUsers((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [selectedCode]: { ...emptyChannel, ...current[userId]?.[selectedCode], ...patch },
      },
    }))

  const saveType = async (type: AlarmTypePolicy) => {
    await alarmManagementService.updateType(type.id, {
      category: type.category,
      acknowledgementScope: type.acknowledgementScope,
    })
    setMessage(t('alarmManagement.messages.typeSaved'))
    await load()
  }

  const saveUser = async (userId: number) => {
    await alarmManagementService.updateUser(userId, draftUsers[userId] ?? {})
    setMessage(t('alarmManagement.messages.userSaved'))
    await load()
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
      <header className="shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t('navigation.admin.title')}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('alarmManagement.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('alarmManagement.description')}</p>
      </header>

      {message ? (
        <div role="status" className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(560px,1.5fr)]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h2 className="font-semibold">{t('alarmManagement.master')}</h2>
            <p className="mt-1 text-xs text-slate-500">{t('alarmManagement.masterHint')}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 text-left dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2">{t('alarmManagement.columns.category')}</th>
                  <th className="px-3 py-2">{t('alarmManagement.columns.name')}</th>
                  <th className="px-3 py-2">{t('alarmManagement.columns.acknowledgement')}</th>
                  <th className="px-3 py-2">{t('alarmManagement.columns.action')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(draftTypes).map((type) => (
                  <tr
                    key={type.id}
                    aria-selected={selectedCode === type.code}
                    onClick={() => setSelectedCode(type.code)}
                    className={`cursor-pointer border-t border-slate-200 dark:border-slate-700 ${selectedCode === type.code ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
                      <select
                        value={type.category}
                        onChange={(event) => updateType(type.id, { category: event.target.value as AlarmTypePolicy['category'] })}
                        className="rounded border px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                      >
                        <option value="GENERAL">{t('alarmManagement.general')}</option>
                        <option value="MODEL">{t('alarmManagement.model')}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{type.nameKo || type.name}</div>
                      {type.description ? <div className="text-xs text-slate-500">{type.description}</div> : null}
                    </td>
                    <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
                      <select
                        value={type.acknowledgementScope}
                        onChange={(event) => updateType(type.id, { acknowledgementScope: event.target.value as AlarmTypePolicy['acknowledgementScope'] })}
                        className="rounded border px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                      >
                        <option value="GROUP">{t('alarmManagement.groupAck')}</option>
                        <option value="INDIVIDUAL">{t('alarmManagement.individualAck')}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
                      <button className="rounded bg-blue-600 px-3 py-1.5 text-white" onClick={() => void saveType(type)}>
                        {t('common.save')}
                      </button>
                    </td>
                  </tr>
                ))}
                {Object.keys(draftTypes).length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">{t('common.noData')}</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h2 className="font-semibold">{t('alarmManagement.detail')}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {selectedType ? `${t('alarmManagement.selectedType')}: ${selectedType.nameKo || selectedType.name}` : t('alarmManagement.selectPrompt')}
            </p>
          </div>
          {!selectedType ? (
            <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">{t('alarmManagement.selectPrompt')}</div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="min-w-[760px] w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100 text-left dark:bg-slate-900">
                  <tr>
                    <th className="px-3 py-2">{t('alarmManagement.columns.user')}</th>
                    <th className="px-3 py-2">{t('alarmManagement.columns.receiver')}</th>
                    <th className="px-3 py-2">{t('alarmManagement.columns.appPush')}</th>
                    <th className="px-3 py-2">{t('alarmManagement.columns.email')}</th>
                    <th className="px-3 py-2">{t('alarmManagement.columns.teamsBot')}</th>
                    <th className="px-3 py-2">{t('alarmManagement.columns.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => {
                    const value = { ...emptyChannel, ...draftUsers[user.userId]?.[selectedCode] }
                    return (
                      <tr key={user.userId} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-3 py-2">{user.name} <span className="text-xs text-slate-500">({user.username})</span></td>
                        <td className="px-3 py-2"><Toggle checked={value.receiver} onChange={(checked) => updateUser(user.userId, { receiver: checked })} /></td>
                        <td className="px-3 py-2"><Toggle checked={value.push} onChange={(checked) => updateUser(user.userId, { push: checked })} /></td>
                        <td className="px-3 py-2"><Toggle checked={value.email} onChange={(checked) => updateUser(user.userId, { email: checked })} /></td>
                        <td className="px-3 py-2"><Toggle checked={value.teams} onChange={(checked) => updateUser(user.userId, { teams: checked })} /></td>
                        <td className="px-3 py-2"><button className="rounded bg-blue-600 px-3 py-1.5 text-white" onClick={() => void saveUser(user.userId)}>{t('common.save')}</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
