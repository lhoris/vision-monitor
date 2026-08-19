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
}

export type UserDangerAction = 'disable' | 'retire' | 'delete-request'

export interface UserListResponse {
  items: UserAccount[]
  total: number
  roles: RoleSummary[]
  page?: number
  pageSize?: number
  summary?: Record<string, number>
}
