import { getMockQueryResult, metadataQueryRegistry } from '@/mocks/metadataQueryRegistry'
import type { MetadataQueryDefinition, MetadataQueryResult } from '@/types/metadataConfig'

export async function listMetadataQueries(): Promise<MetadataQueryDefinition[]> {
  return metadataQueryRegistry.filter((query) => query.enabled)
}

export async function executeMetadataQuery(input: { queryId: string; sourceId: string; signal?: AbortSignal }): Promise<MetadataQueryResult> {
  if (input.signal?.aborted) throw new DOMException('요청이 취소되었습니다.', 'AbortError')
  await new Promise((resolve) => window.setTimeout(resolve, 20))
  if (input.signal?.aborted) throw new DOMException('요청이 취소되었습니다.', 'AbortError')
  return getMockQueryResult(input.queryId, input.sourceId)
}
