import { describe, expect, it } from 'vitest'
import { shouldHandleSessionExpiry } from '../api'

describe('shouldHandleSessionExpiry', () => {
  it('handles the first unauthorized application request', () => {
    expect(shouldHandleSessionExpiry('/model-processes', 401, false)).toBe(true)
  })

  it('ignores login and logout failures', () => {
    expect(shouldHandleSessionExpiry('/auth/login', 401, false)).toBe(false)
    expect(shouldHandleSessionExpiry('/auth/logout', 401, false)).toBe(false)
  })

  it('ignores non-auth failures and repeated session expiry handling', () => {
    expect(shouldHandleSessionExpiry('/model-processes', 403, false)).toBe(false)
    expect(shouldHandleSessionExpiry('/model-processes', 401, true)).toBe(false)
  })
})
