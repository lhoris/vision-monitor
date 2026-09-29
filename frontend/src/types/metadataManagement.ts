export interface MetadataQueryAdmin {
  id: number
  queryCode: string
  queryName: string
  queryDescription?: string | null
  sqlText: string
  parameterSchema?: string | null
  resultSchema?: string | null
  queryTimeoutSec: number
  enabled: boolean
  deleted: boolean
  referenceCount: number
  updatedAt: string
}

export interface MetadataQueryAdminInput {
  queryCode: string
  queryName: string
  queryDescription: string
  sqlText: string
  parameterSchema: string
  resultSchema: string
  queryTimeoutSec: number
  useStatus: 'Y' | 'N'
}

export type MetadataQueryStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED'
