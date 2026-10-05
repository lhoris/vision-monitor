import { createDefaultMetadataProfile } from '@/mocks/metadataQueryRegistry'
import type { MetadataLayoutProfile, MetadataSectionConfig } from '@/types/metadataConfig'
import { apiClient } from './api'
import { getResponseData } from './serviceUtils'

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
    // A missing profile uses the structural default until it is first saved to the database.
  }
  return createDefaultMetadataProfile(userId, sourceId)
}

export async function saveMetadataProfile(profile: MetadataLayoutProfile): Promise<MetadataLayoutProfile> {
  const next = { ...profile, updatedAt: new Date().toISOString(), sections: profile.sections.map((section, index) => ({ ...section, order: index })) }
  const response = await apiClient.put<MetadataLayoutProfile>(`/metadata/profiles/${encodeURIComponent(profile.sourceId)}`, { sections: next.sections })
  const data = getResponseData(response, null)
  if (!data || !Array.isArray(data.sections)) throw new Error('Metadata profile was not saved')
  return { ...data, userId: profile.userId, sourceId: profile.sourceId }
}

export async function resetMetadataProfile(userId: string, sourceId: string): Promise<MetadataLayoutProfile> {
  const profile = createDefaultMetadataProfile(userId, sourceId)
  return saveMetadataProfile(profile)
}
