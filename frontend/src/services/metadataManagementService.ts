import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { ApiResponse } from '@/types/api'
import type { MetadataQueryAdmin, MetadataQueryAdminInput, MetadataQueryStatusFilter } from '@/types/metadataManagement'

const basePath = '/admin/metadata/queries'

export const metadataManagementService = {
  async list(keyword = '', status: MetadataQueryStatusFilter = 'ALL'): Promise<MetadataQueryAdmin[]> {
    return getResponseData(await apiClient.get<MetadataQueryAdmin[]>(basePath, { keyword, status }), [])
  },
  async get(queryCode: string): Promise<MetadataQueryAdmin> {
    return requireData(await apiClient.get<MetadataQueryAdmin>(`${basePath}/${encodeURIComponent(queryCode)}`), 'Query definition was not returned')
  },
  async create(input: MetadataQueryAdminInput): Promise<MetadataQueryAdmin> {
    return requireData(await apiClient.post<MetadataQueryAdmin>(basePath, input), 'Created query definition was not returned')
  },
  async update(queryCode: string, input: MetadataQueryAdminInput): Promise<MetadataQueryAdmin> {
    return requireData(await apiClient.put<MetadataQueryAdmin>(`${basePath}/${encodeURIComponent(queryCode)}`, input), 'Updated query definition was not returned')
  },
  async setEnabled(queryCode: string, enabled: boolean): Promise<MetadataQueryAdmin> {
    const action = enabled ? 'activate' : 'deactivate'
    return requireData(await apiClient.post<MetadataQueryAdmin>(`${basePath}/${encodeURIComponent(queryCode)}/${action}`), 'Updated query definition was not returned')
  },
  async remove(queryCode: string): Promise<void> {
    await apiClient.post(`${basePath}/${encodeURIComponent(queryCode)}/delete`)
  },
}

function requireData<T>(response: ApiResponse<T>, message: string): T {
  const data = getResponseData(response, null)
  if (!data) throw new Error(message)
  return data
}
