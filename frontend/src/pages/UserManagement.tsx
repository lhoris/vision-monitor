import { useCallback, useEffect, useState } from 'react'
import { userManagementService } from '@/services/userManagementService'
import type { RoleSummary, UserAccount, UserDangerAction, UserListResponse, UserManagementFilters, UserMutationRequest } from '@/types/userManagement'
import { UserManagementGrid } from '@/components/UserManagement/UserManagementGrid'
import { UserDetailPanel } from '@/components/UserManagement/UserDetailPanel'
import { UserEditDialog } from '@/components/UserManagement/UserEditDialog'
import { UserDangerDialog } from '@/components/UserManagement/UserDangerDialog'

const initialFilters: UserManagementFilters = { query: '', roleId: 'all', accountStatus: 'all', employmentStatus: 'all' }

export function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [filters, setFilters] = useState(initialFilters)
  const [dialog, setDialog] = useState<'create' | 'edit' | 'danger' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadUsers = useCallback(async (selectId?: number) => {
    setLoading(true); setError('')
    try {
      const result: UserListResponse = await userManagementService.listUsers()
      setUsers(result.items); setRoles(result.roles)
      const nextSelected = selectId ? result.items.find((user) => user.id === selectId) : result.items[0]
      setSelectedUser(nextSelected ?? null)
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : '사용자 목록을 불러오지 못했습니다.') } finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadUsers() }, [loadUsers])

  const submitUser = async (input: UserMutationRequest) => {
    try { const saved = dialog === 'edit' && selectedUser ? await userManagementService.updateUser(selectedUser.id, input) : await userManagementService.createUser(input); setDialog(null); setNotice(dialog === 'edit' ? '사용자 정보가 저장되었습니다.' : '사용자가 등록되었습니다.'); await loadUsers(saved.id) } catch (submitError) { setError(submitError instanceof Error ? submitError.message : '저장에 실패했습니다.'); throw submitError }
  }

  const submitDanger = async (action: UserDangerAction, keepPersonalization: boolean) => {
    if (!selectedUser) return
    try { const saved = await userManagementService.dangerAction(selectedUser.id, action, keepPersonalization); setDialog(null); setNotice('사용자 상태가 변경되었습니다.'); await loadUsers(saved.id) } catch (dangerError) { setError(dangerError instanceof Error ? dangerError.message : '상태 변경에 실패했습니다.'); throw dangerError }
  }

  if (loading) return <section className="flex h-full items-center justify-center p-6 text-sm text-slate-500">사용자 목록을 불러오는 중...</section>
  if (error && !users.length) return <section className="m-6 rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800"><h1 className="font-bold">사용자관리 데이터를 불러올 수 없습니다.</h1><p className="mt-2 text-sm">{error}</p><button type="button" onClick={() => void loadUsers()} className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white">다시 시도</button></section>

  return <section className="flex h-full flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">관리자 메뉴</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">사용자 관리</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">권한과 개인화 기능의 기준이 되는 사용자 계정을 관리합니다.</p></div><button type="button" onClick={() => { setSelectedUser(null); setDialog('create') }} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">+ 신규 사용자</button></div>{notice && <button type="button" onClick={() => setNotice('')} className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{notice} · 클릭하여 닫기</button>}{error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}<div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"><UserManagementGrid users={users} roles={roles} filters={filters} onFiltersChange={setFilters} onSelect={setSelectedUser} /><UserDetailPanel user={selectedUser} onEdit={() => setDialog('edit')} onDanger={() => setDialog('danger')} /></div>{dialog === 'create' && <UserEditDialog roles={roles} users={users} onClose={() => setDialog(null)} onSubmit={submitUser} />}{dialog === 'edit' && selectedUser && <UserEditDialog user={selectedUser} roles={roles} users={users} onClose={() => setDialog(null)} onSubmit={submitUser} />}{dialog === 'danger' && selectedUser && <UserDangerDialog user={selectedUser} onClose={() => setDialog(null)} onSubmit={submitDanger} />}</section>
}

export default UserManagement
