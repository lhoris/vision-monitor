import { apiClient } from './api'
import { getResponseData } from './serviceUtils'
import type { CommonCode, CommonCodeDetail, CommonCodeDetailInput, CommonCodeInput, RuntimeCommonCodes } from '@/types/commonCode'

class CommonCodeService {
  async bootstrap(): Promise<RuntimeCommonCodes> {
    return getResponseData(await apiClient.get<RuntimeCommonCodes>('/common-codes/bootstrap'), { version: '', codes: {} })
  }
  async find(names: string[]): Promise<RuntimeCommonCodes> {
    return getResponseData(await apiClient.get<RuntimeCommonCodes>('/common-codes', { params: { names: names.join(',') } }), { version: '', codes: {} })
  }
  async listAdmin(): Promise<CommonCode[]> {
    return getResponseData(await apiClient.get<CommonCode[]>('/admin/common-codes'), [])
  }
  async create(input: CommonCodeInput): Promise<CommonCode> { return getResponseData(await apiClient.post<CommonCode>('/admin/common-codes', input), {} as CommonCode) }
  async update(id: number, input: CommonCodeInput): Promise<CommonCode> { return getResponseData(await apiClient.put<CommonCode>(`/admin/common-codes/${id}`, input), {} as CommonCode) }
  async deactivate(id: number): Promise<void> { await apiClient.post(`/admin/common-codes/${id}/deactivate`) }
  async listDetails(codeId: number): Promise<CommonCodeDetail[]> { return getResponseData(await apiClient.get<CommonCodeDetail[]>(`/admin/common-codes/${codeId}/details`), []) }
  async createDetail(codeId: number, input: CommonCodeDetailInput): Promise<CommonCodeDetail> { return getResponseData(await apiClient.post<CommonCodeDetail>(`/admin/common-codes/${codeId}/details`, input), {} as CommonCodeDetail) }
  async updateDetail(codeId: number, detailId: number, input: CommonCodeDetailInput): Promise<CommonCodeDetail> { return getResponseData(await apiClient.put<CommonCodeDetail>(`/admin/common-codes/${codeId}/details/${detailId}`, input), {} as CommonCodeDetail) }
  async deactivateDetail(codeId: number, detailId: number): Promise<void> { await apiClient.post(`/admin/common-codes/${codeId}/details/${detailId}/deactivate`) }
}

export const commonCodeService = new CommonCodeService()
