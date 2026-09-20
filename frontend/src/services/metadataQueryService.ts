import { getMockQueryResult, metadataQueryRegistry } from '@/mocks/metadataQueryRegistry'
import type { MetadataQueryDefinition, MetadataQueryResult } from '@/types/metadataConfig'
import { apiClient } from './api'
import { getResponseData } from './serviceUtils'

export async function listMetadataQueries(): Promise<MetadataQueryDefinition[]> {
  try {
    const response = await apiClient.get<Array<Partial<MetadataQueryDefinition> & { queryCode?: string }>>('/metadata/queries')
    const data = getResponseData(response, null)
    if (data) {
      return data.map((query) => ({
        queryId: query.queryId ?? query.queryCode ?? '',
        sqlText: query.sqlText ?? '',
        allowedParameters: query.allowedParameters ?? ['sourceId'],
        resultSchema: query.resultSchema ?? [],
        enabled: query.enabled !== false,
      })).filter((query) => query.queryId)
    }
  } catch {
    // Keep the Mock-First contract available before the backend is deployed.
  }
  return metadataQueryRegistry.filter((query) => query.enabled)
}

export async function executeMetadataQuery(input: { queryId: string; sourceId: string; signal?: AbortSignal }): Promise<MetadataQueryResult> {
  if (input.signal?.aborted) throw new DOMException('Request was aborted', 'AbortError')

  try {
    const sourceId = Number(input.sourceId) || input.sourceId
    const response = await apiClient.post<MetadataQueryResult>(
      `/metadata/queries/${encodeURIComponent(input.queryId)}/execute`,
      { sourceId, parameters: { sourceId } }
    )
    const data = getResponseData(response, null)
    if (data) return data
  } catch {
    // Keep polling independent from backend availability.
  }

  await new Promise((resolve) => window.setTimeout(resolve, 20))
  if (input.signal?.aborted) throw new DOMException('Request was aborted', 'AbortError')
  return getMockQueryResult(input.queryId, input.sourceId)
}
