import type { MetadataQueryDefinition, MetadataQueryResult } from '@/types/metadataConfig'
import { apiClient } from './api'
import { getResponseData } from './serviceUtils'

export async function listMetadataQueries(): Promise<MetadataQueryDefinition[]> {
  const response = await apiClient.get<Array<Partial<MetadataQueryDefinition> & { queryCode?: string }>>('/metadata/queries')
  const data = getResponseData(response, [])
  return data.map((query) => ({
    queryId: query.queryId ?? query.queryCode ?? '',
    sqlText: query.sqlText ?? '',
    allowedParameters: query.allowedParameters ?? ['sourceId'],
    resultSchema: query.resultSchema ?? [],
    enabled: query.enabled !== false,
  })).filter((query) => query.queryId)
}

export async function executeMetadataQuery(input: { queryId: string; sourceId: string; signal?: AbortSignal }): Promise<MetadataQueryResult> {
  if (input.signal?.aborted) throw new DOMException('Request was aborted', 'AbortError')

  const sourceId = Number(input.sourceId) || input.sourceId
  const response = await apiClient.post<MetadataQueryResult>(
    `/metadata/queries/${encodeURIComponent(input.queryId)}/execute`,
    { sourceId, parameters: { sourceId } },
    { signal: input.signal }
  )
  const data = getResponseData(response, null)
  if (!data) {
    throw { code: 'QUERY_FAILED', message: 'Query 결과를 받지 못했습니다.', queryId: input.queryId }
  }
  return data
}
