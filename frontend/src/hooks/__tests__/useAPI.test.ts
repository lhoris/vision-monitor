import { describe, expect, it } from 'vitest'
import { isRetryableAPIError } from '../useAPI'

describe('isRetryableAPIError', () => {
  it('retries transient HTTP failures', () => {
    expect(isRetryableAPIError({ status: 429 })).toBe(true)
    expect(isRetryableAPIError({ status: 503 })).toBe(true)
    expect(isRetryableAPIError({ code: 'NETWORK_ERROR' })).toBe(true)
  })

  it('does not retry client or business errors', () => {
    expect(isRetryableAPIError({ status: 400 })).toBe(false)
    expect(isRetryableAPIError({ status: 401 })).toBe(false)
    expect(isRetryableAPIError({ status: 403 })).toBe(false)
    expect(isRetryableAPIError({ status: 404 })).toBe(false)
    expect(isRetryableAPIError({ status: 409 })).toBe(false)
  })
})
