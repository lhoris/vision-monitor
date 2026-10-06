import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }))

const { apiClient } = await import('../api')
const { metadataManagementService } = await import('../metadataManagementService')
const mockedApiClient = vi.mocked(apiClient)

describe('metadataManagementService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('surfaces a missing response when creating a query', async () => {
    mockedApiClient.post.mockResolvedValue({ success: true, timestamp: '2026-10-06T00:00:00Z' })

    await expect(metadataManagementService.create({
      queryCode: 'camera.status', queryName: 'Camera status', queryDescription: '', sqlText: 'select 1',
      parameterSchema: '[]', resultSchema: '[]', queryTimeoutSec: 5, useStatus: 'Y',
    })).rejects.toThrow('Created query definition was not returned')
  })

  it('keeps the returned query definition on update', async () => {
    mockedApiClient.put.mockResolvedValue({
      success: true,
      data: { queryCode: 'camera.status', queryName: 'Camera status', enabled: true },
      timestamp: '2026-10-06T00:00:00Z',
    })

    await expect(metadataManagementService.update('camera.status', {
      queryCode: 'camera.status', queryName: 'Camera status', queryDescription: '', sqlText: 'select 1',
      parameterSchema: '[]', resultSchema: '[]', queryTimeoutSec: 5, useStatus: 'Y',
    })).resolves.toMatchObject({ queryCode: 'camera.status' })
  })
})
