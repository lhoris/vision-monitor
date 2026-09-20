import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Common'
import { userAlertPreferenceService, type UserAlertPreferences } from '@/services/userAlertPreferenceService'

export function Settings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<UserAlertPreferences | null>(null)
  const [savedSettings, setSavedSettings] = useState<UserAlertPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    userAlertPreferenceService.get()
      .then((result) => {
        if (!active) return
        setSettings(result)
        setSavedSettings(result)
      })
      .catch(() => { if (active) setError(t('settings.loadError')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [t])

  const dirty = settings !== null && savedSettings !== null
    && (settings.emailEnabled !== savedSettings.emailEnabled || settings.smsEnabled !== savedSettings.smsEnabled)

  const setEnabled = (field: 'emailEnabled' | 'smsEnabled', enabled: boolean) => {
    setSettings((current) => current ? { ...current, [field]: enabled } : current)
    setError('')
    setNotice('')
  }

  async function save() {
    if (!settings) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const saved = await userAlertPreferenceService.save({
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
      })
      setSettings(saved)
      setSavedSettings(saved)
      setNotice(t('settings.saved'))
    } catch {
      setError(t('settings.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-6 text-gray-900 dark:text-gray-100">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('settings.notificationSubtitle')}</p>
      </header>

      {loading ? <p role="status" className="text-sm text-gray-500">{t('common.loading')}</p> : null}
      {error && !settings ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      {settings ? (
        <section className="max-w-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold">{t('settings.notificationSettings')}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('settings.accountEmail')}
              <input readOnly value={settings.email ?? ''} placeholder={t('settings.contactNotRegistered')} className="mt-1 h-10 w-full rounded border border-gray-300 bg-gray-100 px-3 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('settings.accountPhone')}
              <input readOnly value={settings.phone ?? ''} placeholder={t('settings.contactNotRegistered')} className="mt-1 h-10 w-full rounded border border-gray-300 bg-gray-100 px-3 text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300" />
            </label>
          </div>
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-5 dark:border-gray-700">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={settings.emailEnabled} disabled={!settings.email && !settings.emailEnabled} onChange={(event) => setEnabled('emailEnabled', event.target.checked)} />
              <span>{t('settings.emailNotifications')}</span>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={settings.smsEnabled} disabled={!settings.phone && !settings.smsEnabled} onChange={(event) => setEnabled('smsEnabled', event.target.checked)} />
              <span>{t('settings.smsAlerts')}</span>
            </label>
          </div>
          {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : null}
          {notice ? <p role="status" className="mt-4 text-sm text-emerald-600">{notice}</p> : null}
          <div className="mt-5 flex justify-end">
            <Button type="button" onClick={() => void save()} disabled={!dirty} isLoading={saving}>{t('common.save')}</Button>
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default Settings
