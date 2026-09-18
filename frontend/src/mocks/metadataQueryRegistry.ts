import type { MetadataLayoutProfile, MetadataQueryDefinition, MetadataQueryResult, MetadataSectionConfig } from '@/types/metadataConfig'

const connectionSchema = [
  { name: 'label', label: '항목', type: 'string' as const },
  { name: 'value', label: '값', type: 'string' as const },
]
const cameraInfoSchema = connectionSchema
const cameraStatusSchema = connectionSchema
const settingsSchema = [
  { name: 'code', label: '냉각 코드', type: 'string' as const },
  { name: 'baseSpeed', label: '기존 속도', type: 'number' as const },
  { name: 'targetSpeed', label: '증속 속도', type: 'number' as const },
  { name: 'holdSeconds', label: '유지 시간', type: 'number' as const },
]
const eventsSchema = [
  { name: 'category', label: '구분', type: 'string' as const },
  { name: 'grade', label: '규격', type: 'string' as const },
  { name: 'size', label: '사이즈', type: 'number' as const },
  { name: 'occurredAt', label: '이벤트 시간', type: 'datetime' as const },
  { name: 'eventId', label: '이벤트 ID', type: 'number' as const },
  { name: 'playbackAvailable', label: '재생 가능', type: 'boolean' as const },
]

export const metadataQueryRegistry: MetadataQueryDefinition[] = [
  { queryId: 'camera.info', sqlText: 'SELECT camera_name, process_type, zone_name FROM cameras WHERE source_id = :sourceId', allowedParameters: ['sourceId'], resultSchema: cameraInfoSchema, enabled: true },
  { queryId: 'camera.connection-status', sqlText: 'SELECT status, last_seen_at FROM camera_status WHERE source_id = :sourceId', allowedParameters: ['sourceId'], resultSchema: connectionSchema, enabled: true },
  { queryId: 'camera.status', sqlText: 'SELECT status, last_seen_at FROM camera_status WHERE source_id = :sourceId', allowedParameters: ['sourceId'], resultSchema: cameraStatusSchema, enabled: true },
  { queryId: 'camera.cooling-settings', sqlText: 'SELECT code, base_speed, target_speed, hold_seconds FROM cooling_settings WHERE source_id = :sourceId', allowedParameters: ['sourceId'], resultSchema: settingsSchema, enabled: true },
  { queryId: 'camera.recent-events', sqlText: 'SELECT category, grade, size, occurred_at, event_id FROM camera_events WHERE source_id = :sourceId', allowedParameters: ['sourceId'], resultSchema: eventsSchema, enabled: true },
  { queryId: 'camera.disabled-example', sqlText: 'SELECT 1', allowedParameters: [], resultSchema: [], enabled: false },
]

const sourceSections: Record<string, MetadataSectionConfig[]> = {
  '1': [
    { id: 'camera', title: '카메라 정보', type: 'text', order: 0, visible: true, queryId: 'camera.info', refreshIntervalSec: 30, mapping: { labelField: 'label', valueField: 'value', fields: ['label', 'value'] }, sourceProfileStatus: 'included' },
    { id: 'status', title: '연결 상태', type: 'text', order: 1, visible: true, queryId: 'camera.status', refreshIntervalSec: 5, mapping: { labelField: 'label', valueField: 'value', fields: ['label', 'value'] }, sourceProfileStatus: 'included' },
    { id: 'alarm', title: '알람 정보', type: 'grid', order: 2, visible: true, queryId: 'camera.recent-events', refreshIntervalSec: 10, mapping: { columns: [{ field: 'category' }, { field: 'grade' }, { field: 'size' }, { field: 'occurredAt', format: 'datetime' }], eventIdField: 'eventId', occurredAtField: 'occurredAt', playbackAvailableField: 'playbackAvailable' }, sourceProfileStatus: 'included' },
  ],
  '2': [
    { id: 'connection', title: '연결 상태', type: 'text', order: 0, visible: true, queryId: 'camera.connection-status', refreshIntervalSec: 5, mapping: { labelField: 'label', valueField: 'value' }, sourceProfileStatus: 'included' },
    { id: 'events', title: '최근 알람', type: 'grid', order: 1, visible: true, queryId: 'camera.recent-events', refreshIntervalSec: 30, mapping: { columns: [{ field: 'category' }, { field: 'occurredAt', format: 'datetime' }], eventIdField: 'eventId', occurredAtField: 'occurredAt', playbackAvailableField: 'playbackAvailable' }, sourceProfileStatus: 'included' },
  ],
}

export function createDefaultMetadataProfile(userId: string, sourceId: string): MetadataLayoutProfile {
  const sections = (sourceSections[sourceId] ?? sourceSections['1']).map((section) => ({ ...section, mapping: structuredClone(section.mapping) }))
  return { userId, sourceId, sections, updatedAt: new Date().toISOString() }
}

export function getMockQueryResult(queryId: string, sourceId: string): MetadataQueryResult {
  const now = new Date().toISOString()
  const results: Record<string, Record<string, unknown>[]> = {
    'camera.info': [{ label: '카메라', value: 'Entry Zone CAM-01' }, { label: '공정', value: '냉각' }, { label: '구역', value: 'Entry Zone' }],
    'camera.connection-status': [{ label: '연결 상태', value: '정상' }, { label: '마지막 수신', value: now }],
    'camera.status': [{ label: '상태', value: 'online' }, { label: '마지막 수신', value: now }],
    'camera.cooling-settings': [{ code: 'Q', baseSpeed: 0.35, targetSpeed: 0.7, holdSeconds: 5 }, { code: 'P', baseSpeed: 0.5, targetSpeed: 1.0, holdSeconds: 5 }],
    'camera.recent-events': [{ category: '최근 알람', grade: sourceId === '2' ? 'JS-SWRH72' : 'SAE1018Q', size: 20, occurredAt: now, eventId: 50001, playbackAvailable: true }, { category: '2', grade: 'SAE1018Q', size: 22, occurredAt: now, eventId: 50002, playbackAvailable: true }],
  }
  const definition = metadataQueryRegistry.find((query) => query.queryId === queryId)
  if (!definition) throw { code: 'QUERY_NOT_FOUND', message: `Query를 찾을 수 없습니다: ${queryId}`, queryId }
  return { queryId, schema: definition.resultSchema, rows: results[queryId] ?? [], fetchedAt: now }
}
