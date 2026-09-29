import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { MetadataQueryAdmin, MetadataQueryAdminInput, MetadataQueryStatusFilter } from '@/types/metadataManagement'

const basePath = '/admin/metadata/queries'

export const metadataManagementService = {
  async list(keyword = '', status: MetadataQueryStatusFilter = 'ALL'): Promise<MetadataQueryAdmin[]> {
    return getResponseData(await apiClient.get<MetadataQueryAdmin[]>(basePath, { keyword, status }), [])
  },
  async get(queryCode: string): Promise<MetadataQueryAdmin> {
    return getResponseData(await apiClient.get<MetadataQueryAdmin>(`${basePath}/${encodeURIComponent(queryCode)}`), {} as MetadataQueryAdmin)
  },
  async create(input: MetadataQueryAdminInput): Promise<MetadataQueryAdmin> {
    return getResponseData(await apiClient.post<MetadataQueryAdmin>(basePath, input), {} as MetadataQueryAdmin)
  },
  async update(queryCode: string, input: MetadataQueryAdminInput): Promise<MetadataQueryAdmin> {
    return getResponseData(await apiClient.put<MetadataQueryAdmin>(`${basePath}/${encodeURIComponent(queryCode)}`, input), {} as MetadataQueryAdmin)
  },
  async setEnabled(queryCode: string, enabled: boolean): Promise<MetadataQueryAdmin> {
    const action = enabled ? 'activate' : 'deactivate'
    return getResponseData(await apiClient.post<MetadataQueryAdmin>(`${basePath}/${encodeURIComponent(queryCode)}/${action}`), {} as MetadataQueryAdmin)
  },
  async remove(queryCode: string): Promise<void> {
    await apiClient.post(`${basePath}/${encodeURIComponent(queryCode)}/delete`)
  },
}
