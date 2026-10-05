import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))

vi.mock('../api', () => ({
  apiClient: { get, post },
}))

import { executeMetadataQuery, listMetadataQueries } from '../metadataQueryService'

describe('metadataQueryService', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('loads query definitions from the backend catalog', async () => {
    get.mockResolvedValue({
      data: [{ queryCode: 'Q_STATUS', queryName: 'Status', useStatus: 'Y' }],
    })

    await expect(listMetadataQueries()).resolves.toEqual([expect.objectContaining({ queryId: 'Q_STATUS', enabled: true })])
    expect(get).toHaveBeenCalledWith('/metadata/queries')
  })

  it('forwards the abort signal to the metadata query request', async () => {
    const controller = new AbortController()
    post.mockResolvedValue({
      data: {
        queryId: 'Q_STATUS',
        schema: [],
        rows: [],
        fetchedAt: '2026-10-05T00:00:00Z',
      },
    })

    await executeMetadataQuery({ queryId: 'Q_STATUS', sourceId: '12', signal: controller.signal })

    expect(post).toHaveBeenCalledWith(
      '/metadata/queries/Q_STATUS/execute',
      { sourceId: 12, parameters: { sourceId: 12 } },
      { signal: controller.signal }
    )
  })

  it('rejects an already aborted request before contacting the API', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(executeMetadataQuery({ queryId: 'Q_STATUS', sourceId: '12', signal: controller.signal }))
      .rejects.toMatchObject({ name: 'AbortError' })
    expect(post).not.toHaveBeenCalled()
  })

  it('propagates backend query failures instead of returning fixture data', async () => {
    post.mockRejectedValue({ code: 'METADATA_QUERY_NOT_FOUND', message: 'Query not found' })

    await expect(executeMetadataQuery({ queryId: 'Q_UNKNOWN', sourceId: '12' }))
      .rejects.toMatchObject({ code: 'METADATA_QUERY_NOT_FOUND' })
  })
})
