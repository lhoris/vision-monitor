export type AccountStatus = 'active' | 'locked' | 'disabled'
export type EmploymentStatus = 'employed' | 'leave' | 'retired'

export interface RoleSummary {
  id: string
  name: string
  description: string
}

export interface UserPersonalizationSummary {
  hasSettings: boolean
  cameraGridCount: number
  lastUpdatedAt?: string
}

export interface UserAccount {
  id: number
  username: string
  name: string
  displayName: string
  department: string
  position: string
  email: string
  phone: string
  orgUnitId?: number
  orgUnitName?: string
  roleIds: string[]
  roles: RoleSummary[]
  accountStatus: AccountStatus
  employmentStatus: EmploymentStatus
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  updatedBy: string
  personalization: UserPersonalizationSummary
  employeeNo?: string
  remarks?: string
  dataEndStatus?: 'N' | 'Y'
}

export interface UserManagementFilters {
  query: string
  roleId: string
  accountStatus: AccountStatus | 'all'
  employmentStatus: EmploymentStatus | 'all'
}

export interface UserMutationRequest {
  username: string
  name: string
  displayName: string
  department: string
  position: string
  email: string
  phone: string
  orgUnitId?: number
  roleIds: string[]
  accountStatus: AccountStatus
  employmentStatus: EmploymentStatus
  resetPassword?: boolean
}

export type UserDangerAction = 'lock' | 'unlock' | 'disable' | 'retire' | 'delete-request'
export type UserGridRowState = 'clean' | 'new' | 'dirty' | 'discardRequested' | 'invalid' | 'saving'

export interface UserGridSaveRequest {
  rowId: string
  userId?: number
  input: UserMutationRequest
}

export interface UserListResponse {
  items: UserAccount[]
  total: number
  roles: RoleSummary[]
  page?: number
  pageSize?: number
  summary?: Record<string, number>
}
