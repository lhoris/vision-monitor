import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserManagementGrid } from '@/components/UserManagement/UserManagementGrid'
import { userManagementService } from '@/services/userManagementService'
import type {
  RoleSummary,
  UserAccount,
  UserDangerAction,
  UserGridSaveRequest,
  UserListResponse,
} from '@/types/userManagement'
import { useCommonCode } from '@/hooks/useCommonCode'

export function UserManagement() {
  const { t } = useTranslation()
  const classCode = useCommonCode('USER_CLASS')
  const [users, setUsers] = useState<UserAccount[]>([])
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const currentUsername = useMemo(() => localStorage.getItem('authUsername') ?? '', [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result: UserListResponse = await userManagementService.listUsers({ pageSize: 500 })
      setUsers(result.items)
      setRoles(result.roles)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('userManagement.loadError'))
    } finally {
      setLoading(false)
      setInitialLoadComplete(true)
    }
  }, [t])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  const runBatchAction = async (action: UserDangerAction, userIds: number[]) => {
    setError('')
    try {
      for (const userId of userIds) {
        await userManagementService.dangerAction(userId, action, true)
      }
      setNotice(action === 'delete-request'
        ? t('userManagement.deleteSuccess', { count: userIds.length })
        : t('userManagement.statusChanged', { count: userIds.length }))
      await loadUsers()
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : t('userManagement.statusChangeError')
      setError(message)
      throw actionError
    }
  }

  const saveChanges = async (changes: UserGridSaveRequest[]) => {
    setError('')
    try {
      await Promise.all(changes.map(({ userId, input }) => userId
        ? userManagementService.updateUser(userId, input)
        : userManagementService.createUser(input)))
      setNotice(t('userManagement.saveSuccess', { count: changes.length }))
      await loadUsers()
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : t('userManagement.saveError')
      setError(message)
      throw saveError
    }
  }

  const resetPassword = async (userId: number) => {
    setError('')
    try {
      const resetUser = await userManagementService.resetPassword(userId)
      setUsers((currentUsers) => currentUsers.map((user) => user.id === userId
        ? { ...user, ...resetUser, passwordResetRequired: true }
        : user))
      setNotice(t('userManagement.passwordResetSuccess'))
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : t('userManagement.passwordResetError'))
      throw resetError
    }
  }

  const approveUser = async (userId: number) => {
    await userManagementService.approveUser(userId)
    setNotice(t('userManagement.approvalSuccess'))
    await loadUsers()
  }

  const rejectUser = async (userId: number, reason: string) => {
    await userManagementService.rejectUser(userId, reason)
    setNotice(t('userManagement.rejectionSuccess'))
    await loadUsers()
  }

  if (loading && !initialLoadComplete) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
        {t('userManagement.loading')}
      </section>
    )
  }

  if (error && !users.length) {
    return (
      <section className="m-6 rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h1 className="font-bold">{t('userManagement.loadError')}</h1>
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => void loadUsers()}
          className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {t('userManagement.retry')}
        </button>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t('userManagement.adminMenu')}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('userManagement.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('userManagement.subtitle')}
          </p>
        </div>
      </div>

      {notice && (
        <div role="status" className="animate-toast-in-out fixed right-6 top-20 z-50 flex max-w-sm items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200">
          <span className="whitespace-pre-line">{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-200 dark:hover:text-white" aria-label={t('userManagement.closeNotice')}>×</button>
        </div>
      )}
      {error && (
        <div role="alert" className="fixed right-6 top-20 z-50 max-w-sm rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg">
          {error}
        </div>
      )}

      <UserManagementGrid
        users={users}
        roles={roles}
        classOptions={[{ value: '', label: '전체' }, ...(classCode?.items ?? []).filter((item) => item.value !== 'COMMON').map((item) => ({ value: item.value, label: item.nameKo || item.name }))]}
        currentUsername={currentUsername}
        onBatchAction={runBatchAction}
        onSaveChanges={saveChanges}
        onRefresh={loadUsers}
        onClearNotice={() => setNotice('')}
        onResetPassword={resetPassword}
        onApprove={approveUser}
        onReject={rejectUser}
      />
    </section>
  )
}

export default UserManagement
