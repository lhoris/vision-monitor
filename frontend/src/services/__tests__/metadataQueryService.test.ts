import { beforeEach, describe, expect, it, vi } from 'vitest'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('../api', () => ({
  apiClient: { post },
}))

import { executeMetadataQuery } from '../metadataQueryService'

describe('metadataQueryService', () => {
  beforeEach(() => {
    post.mockReset()
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
})
