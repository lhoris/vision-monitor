import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))

const { apiClient } = await import('../api')
const { videoSourceService } = await import('../videoSourceService')
const mockedApiClient = vi.mocked(apiClient)

const input = {
  name: 'Entry Camera',
  url: 'http://localhost:8889/sample001/whep',
  protocol: 'WEBRTC' as const,
  location: '4F',
  zone: 'Heating',
  status: 'ACTIVE' as const,
  remarks: '',
}

describe('videoSourceService CRUD responses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('surfaces a missing response when creating a source', async () => {
    mockedApiClient.post.mockResolvedValue({ success: true, timestamp: '2026-10-06T00:00:00Z' })

    await expect(videoSourceService.create(input)).rejects.toThrow('Created video source was not returned')
  })

  it('keeps the returned source when updating a source', async () => {
    mockedApiClient.put.mockResolvedValue({
      success: true,
      data: { id: 101, ...input },
      timestamp: '2026-10-06T00:00:00Z',
    })

    await expect(videoSourceService.update(101, input)).resolves.toMatchObject({ id: 101, name: 'Entry Camera' })
  })
})
