import { describe, expect, it, vi } from 'vitest'
import { getResponseData, withServiceFallback } from '../serviceUtils'

describe('serviceUtils', () => {
  it('unwraps response data', () => {
    expect(getResponseData({ success: true, data: 'ok', timestamp: 'now' }, 'fallback')).toBe('ok')
  })

  it('returns fallback when response data is missing', () => {
    expect(getResponseData({ success: true, timestamp: 'now' }, 'fallback')).toBe('fallback')
  })

  it('returns operation result', async () => {
    await expect(withServiceFallback(() => Promise.resolve(1), 0, 'failed')).resolves.toBe(1)
  })

  it('logs and returns fallback on failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(
      withServiceFallback(() => Promise.reject(new Error('nope')), 0, 'failed')
    ).resolves.toBe(0)
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
