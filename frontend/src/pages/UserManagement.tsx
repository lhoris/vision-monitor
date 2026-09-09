import { useCallback, useEffect, useMemo, useState } from 'react'
import { UserManagementGrid } from '@/components/UserManagement/UserManagementGrid'
import { userManagementService } from '@/services/userManagementService'
import type {
  RoleSummary,
  UserAccount,
  UserDangerAction,
  UserGridSaveRequest,
  UserListResponse,
} from '@/types/userManagement'

export function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [loading, setLoading] = useState(true)
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
      setError(loadError instanceof Error ? loadError.message : '사용자 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const saveChanges = async (changes: UserGridSaveRequest[]) => {
    setError('')
    try {
      for (const change of changes) {
        if (change.userId) {
          await userManagementService.updateUser(change.userId, change.input)
        } else {
          await userManagementService.createUser(change.input)
        }
      }
      setNotice(`${changes.length}건의 사용자 변경을 저장했습니다.`)
      await loadUsers()
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : '사용자 변경 저장에 실패했습니다.'
      setError(message)
      throw saveError
    }
  }

  const runBatchAction = async (action: UserDangerAction, userIds: number[]) => {
    setError('')
    try {
      for (const userId of userIds) {
        await userManagementService.dangerAction(userId, action, true)
      }
      setNotice(`${userIds.length}명의 사용자 상태를 변경했습니다.`)
      await loadUsers()
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : '사용자 상태 변경에 실패했습니다.'
      setError(message)
      throw actionError
    }
  }

  if (loading) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
        사용자 목록을 불러오는 중...
      </section>
    )
  }

  if (error && !users.length) {
    return (
      <section className="m-6 rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <h1 className="font-bold">사용자관리 데이터를 불러올 수 없습니다.</h1>
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => void loadUsers()}
          className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">관리자 메뉴</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">사용자 관리</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            그리드에서 신규 사용자 생성, 정보 수정, 계정 상태 변경을 처리합니다.
          </p>
        </div>
      </div>

      {notice && (
        <button
          type="button"
          onClick={() => setNotice('')}
          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
        >
          {notice} - 클릭하여 닫기
        </button>
      )}
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <UserManagementGrid
        users={users}
        roles={roles}
        currentUsername={currentUsername}
        onSaveChanges={saveChanges}
        onBatchAction={runBatchAction}
        onRefresh={loadUsers}
      />
    </section>
  )
}

export default UserManagement
