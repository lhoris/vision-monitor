import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@/components/Common'
import { authService, type MyProfile } from '@/services/authService'

export function AccountProfile() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordNotice, setPasswordNotice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    authService.getMyProfile()
      .then((result) => { if (active) setProfile(result) })
      .catch(() => { if (active) setProfileError(t('account.profile.loadError')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [t])

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError('')
    setPasswordNotice('')
    if (newPassword.length < 8) {
      setPasswordError(t('account.profile.passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('account.profile.passwordMismatch'))
      return
    }
    setSaving(true)
    try {
      await authService.changePassword(newPassword, currentPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordNotice(t('account.profile.passwordChanged'))
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
          ? error.message
          : t('account.profile.passwordError')
      setPasswordError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-6 text-gray-900 dark:text-gray-100">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{t('account.profile.title')}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('account.profile.subtitle')}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold">{t('account.profile.accountInfo')}</h2>
          {loading ? <p role="status" className="text-sm text-gray-500">{t('common.loading')}</p> : null}
          {profileError ? <p role="alert" className="text-sm text-red-600">{profileError}</p> : null}
          {profile ? (
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              <ProfileField label={t('account.profile.loginId')} value={profile.username} />
              <ProfileField label={t('account.profile.name')} value={profile.name || t('account.profile.notRegistered')} />
              <ProfileField label={t('account.profile.role')} value={t(`account.roles.${profile.role}`)} />
              <ProfileField label={t('account.profile.userNumber')} value={String(profile.id)} />
              <ProfileField label={t('account.profile.email')} value={profile.email || t('account.profile.notRegistered')} />
              <ProfileField label={t('account.profile.phone')} value={profile.phone || t('account.profile.notRegistered')} />
            </dl>
          ) : null}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{t('account.profile.contactAdmin')}</p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h2 className="text-lg font-semibold">{t('account.profile.changePassword')}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('account.profile.passwordHint')}</p>
          </div>
          <Input id="current-password" label={t('account.profile.currentPassword')} type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
          <Input id="new-password" label={t('account.profile.newPassword')} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required />
          <Input id="confirm-password" label={t('account.profile.confirmPassword')} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          {passwordError ? <p role="alert" className="text-sm text-red-600">{passwordError}</p> : null}
          {passwordNotice ? <p role="status" className="text-sm text-emerald-600">{passwordNotice}</p> : null}
          <div className="flex justify-end"><Button type="submit" isLoading={saving}>{t('account.profile.updatePassword')}</Button></div>
        </form>
      </section>
    </main>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[minmax(7rem,1fr)_2fr] gap-4 py-3 text-sm"><dt className="text-gray-500 dark:text-gray-400">{label}</dt><dd className="break-words font-medium">{value}</dd></div>
}
