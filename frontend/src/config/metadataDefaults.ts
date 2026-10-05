import type { MetadataLayoutProfile, MetadataSectionConfig } from '@/types/metadataConfig'

const defaultSectionsBySource: Record<string, MetadataSectionConfig[]> = {
  '1': [
    { id: 'camera', title: '\uCE74\uBA54\uB77C \uC815\uBCF4', type: 'text', order: 0, visible: true, queryId: 'camera.info', refreshIntervalSec: 30, mapping: { labelField: 'label', valueField: 'value', fields: ['label', 'value'] }, sourceProfileStatus: 'included' },
    { id: 'status', title: '\uC5F0\uACB0 \uC0C1\uD0DC', type: 'text', order: 1, visible: true, queryId: 'camera.status', refreshIntervalSec: 5, mapping: { labelField: 'label', valueField: 'value', fields: ['label', 'value'] }, sourceProfileStatus: 'included' },
    { id: 'alarm', title: '\uC54C\uB78C \uC815\uBCF4', type: 'grid', order: 2, visible: true, queryId: 'camera.recent-events', refreshIntervalSec: 10, mapping: { columns: [{ field: 'category' }, { field: 'grade' }, { field: 'size' }, { field: 'occurredAt', format: 'datetime' }], eventIdField: 'eventId', occurredAtField: 'occurredAt', playbackAvailableField: 'playbackAvailable' }, sourceProfileStatus: 'included' },
  ],
  '2': [
    { id: 'connection', title: '\uC5F0\uACB0 \uC0C1\uD0DC', type: 'text', order: 0, visible: true, queryId: 'camera.connection-status', refreshIntervalSec: 5, mapping: { labelField: 'label', valueField: 'value' }, sourceProfileStatus: 'included' },
    { id: 'events', title: '\uCD5C\uADFC \uC54C\uB78C', type: 'grid', order: 1, visible: true, queryId: 'camera.recent-events', refreshIntervalSec: 30, mapping: { columns: [{ field: 'category' }, { field: 'occurredAt', format: 'datetime' }], eventIdField: 'eventId', occurredAtField: 'occurredAt', playbackAvailableField: 'playbackAvailable' }, sourceProfileStatus: 'included' },
  ],
}

export function createDefaultMetadataProfile(userId: string, sourceId: string): MetadataLayoutProfile {
  const sections = (defaultSectionsBySource[sourceId] ?? defaultSectionsBySource['1']).map((section) => ({
    ...section,
    mapping: structuredClone(section.mapping),
  }))
  return { userId, sourceId, sections, updatedAt: new Date().toISOString() }
}
