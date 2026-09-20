import { createDefaultMetadataProfile } from '@/mocks/metadataQueryRegistry'
import type { MetadataLayoutProfile, MetadataSectionConfig } from '@/types/metadataConfig'
import { apiClient } from './api'
import { getResponseData } from './serviceUtils'

const STORAGE_PREFIX = 'metadata-layout:'

function storageKey(userId: string, sourceId: string) {
  return `${STORAGE_PREFIX}${userId}:${sourceId}`
}

function normalizeProfile(value: unknown, userId: string, sourceId: string): MetadataLayoutProfile | null {
  if (!value || typeof value !== 'object') return null
  const profile = value as Partial<MetadataLayoutProfile>
  if (profile.userId !== userId || profile.sourceId !== sourceId || !Array.isArray(profile.sections)) return null
  return { userId, sourceId, sections: profile.sections as MetadataSectionConfig[], updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : new Date().toISOString() }
}

export async function getMetadataProfile(userId: string, sourceId: string): Promise<MetadataLayoutProfile> {
  try {
    const response = await apiClient.get<MetadataLayoutProfile>(`/metadata/profiles/${encodeURIComponent(sourceId)}`)
    const data = getResponseData(response, null)
    if (data && Array.isArray(data.sections)) {
      return {
        userId,
        sourceId,
        sections: data.sections as MetadataSectionConfig[],
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      }
    }
  } catch {
    // Local storage and fixture fallback preserve the current Mock-First flow.
  }
  const raw = localStorage.getItem(storageKey(userId, sourceId))
  if (raw) {
    try {
      const profile = normalizeProfile(JSON.parse(raw), userId, sourceId)
      if (profile) return profile
    } catch {
      localStorage.removeItem(storageKey(userId, sourceId))
    }
  }
  return createDefaultMetadataProfile(userId, sourceId)
}

export async function saveMetadataProfile(profile: MetadataLayoutProfile): Promise<MetadataLayoutProfile> {
  const next = { ...profile, updatedAt: new Date().toISOString(), sections: profile.sections.map((section, index) => ({ ...section, order: index })) }
  localStorage.setItem(storageKey(profile.userId, profile.sourceId), JSON.stringify(next))
  return next
}

export async function resetMetadataProfile(userId: string, sourceId: string): Promise<MetadataLayoutProfile> {
  const profile = createDefaultMetadataProfile(userId, sourceId)
  localStorage.removeItem(storageKey(userId, sourceId))
  return profile
}
