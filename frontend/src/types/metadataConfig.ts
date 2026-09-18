export type MetadataSectionType = 'text' | 'grid' | 'chart'
export type MetadataResultFieldType = 'string' | 'number' | 'boolean' | 'datetime'
export type MetadataSectionStatus = 'loading' | 'success' | 'empty' | 'error' | 'stale'

export interface MetadataResultField {
  name: string
  label: string
  type: MetadataResultFieldType
}

export interface MetadataQueryDefinition {
  queryId: string
  sqlText: string
  allowedParameters: string[]
  resultSchema: MetadataResultField[]
  enabled: boolean
}

export interface MetadataQueryResult {
  queryId: string
  schema: MetadataResultField[]
  rows: Record<string, unknown>[]
  fetchedAt: string
}

export interface MetadataTextMapping {
  labelField?: string
  valueField?: string
  fields?: string[]
}

export interface MetadataGridColumn {
  field: string
  label?: string
  format?: 'text' | 'number' | 'datetime'
}

export interface MetadataGridMapping {
  columns: MetadataGridColumn[]
  eventIdField?: string
  occurredAtField?: string
  playbackAvailableField?: string
}

export interface MetadataChartSeries {
  field: string
  label: string
  color?: string
}

export interface MetadataChartMapping {
  timeField: string
  series: MetadataChartSeries[]
}

export type MetadataMapping = MetadataTextMapping | MetadataGridMapping | MetadataChartMapping

export interface MetadataSectionOptions {
  compact?: boolean
}

export interface MetadataSectionConfig {
  id: string
  title: string
  type: MetadataSectionType
  order: number
  visible: boolean
  queryId?: string
  refreshIntervalSec: 5 | 10 | 30 | 60
  mapping: MetadataMapping
  defaultText?: string
  options?: MetadataSectionOptions
  sourceProfileStatus: 'included' | 'excluded'
}

export interface MetadataLayoutProfile {
  userId: string
  sourceId: string
  sections: MetadataSectionConfig[]
  updatedAt: string
}

export interface MetadataQueryError {
  code: 'QUERY_NOT_FOUND' | 'QUERY_DISABLED' | 'INVALID_MAPPING' | 'QUERY_FAILED'
  message: string
  queryId?: string
}

export interface MetadataPollingState {
  status: MetadataSectionStatus
  result: MetadataQueryResult | null
  error: MetadataQueryError | null
}
