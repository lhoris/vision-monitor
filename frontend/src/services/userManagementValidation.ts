import type { UserAccount, UserDangerAction, UserMutationRequest } from '@/types/userManagement'

export type UserValidationErrors = Partial<Record<keyof UserMutationRequest | 'action', string>>

export function validateUserMutation(
  input: UserMutationRequest,
  users: UserAccount[],
  editingUserId?: number
): UserValidationErrors {
  const errors: UserValidationErrors = {}
  if (!input.username.trim()) errors.username = '사용자 ID를 입력하세요.'
  if (!input.name.trim()) errors.name = '이름을 입력하세요.'
  if (!input.displayName.trim()) errors.displayName = '표시명을 입력하세요.'
  if (!input.roleIds.length) errors.roleIds = '역할을 하나 이상 선택하세요.'
  if (!input.email.trim() || !/^\S+@\S+\.\S+$/.test(input.email)) errors.email = '올바른 이메일 형식을 입력하세요.'
  if (users.some((user) => user.username === input.username.trim() && user.id !== editingUserId)) {
    errors.username = '이미 사용 중인 사용자 ID입니다.'
  }
  return errors
}

export function canPerformDangerAction(
  action: UserDangerAction,
  target: UserAccount,
  currentUsername: string,
  users: UserAccount[]
): string | null {
  const isSelf = target.username === currentUsername
  if (isSelf && action !== 'retire') return '현재 로그인한 계정에는 이 작업을 수행할 수 없습니다.'

  const activeAdmins = users.filter(
    (user) => user.accountStatus === 'active' && user.roleIds.includes('admin')
  )
  if (target.roleIds.includes('admin') && activeAdmins.length <= 1 && action !== 'retire') {
    return '마지막 활성 관리자 계정은 변경하거나 삭제할 수 없습니다.'
  }
  return null
}
