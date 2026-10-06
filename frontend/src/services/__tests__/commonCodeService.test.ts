import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))

const { apiClient } = await import('../api')
const { commonCodeService } = await import('../commonCodeService')
const mockedApiClient = vi.mocked(apiClient)

describe('commonCodeService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('surfaces a missing code response instead of returning an empty code', async () => {
    mockedApiClient.post.mockResolvedValue({ success: true, timestamp: '2026-10-06T00:00:00Z' })

    await expect(commonCodeService.create({ name: 'PROCESS_AREA', description: '', type: 'SYSTEM', remarks: '' }))
      .rejects.toThrow('Created common code was not returned')
  })

  it('keeps returned code details when the API succeeds', async () => {
    mockedApiClient.post.mockResolvedValue({
      success: true,
      data: { id: 1, value: 'HEATING', name: 'Heating', nameKo: '가열', nameEn: 'Heating', sortOrder: 10 },
      timestamp: '2026-10-06T00:00:00Z',
    })

    await expect(commonCodeService.createDetail(1, {
      value: 'HEATING', name: 'Heating', nameKo: '가열', nameEn: 'Heating', description: '', sortOrder: 10,
      defaultValue: '', remarks: '',
    })).resolves.toMatchObject({ value: 'HEATING' })
  })
})
