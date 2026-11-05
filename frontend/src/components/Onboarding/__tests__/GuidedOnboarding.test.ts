import { beforeEach, describe, expect, it, vi } from 'vitest'
import { driver } from 'driver.js'
import { resolveOnboardingRoute, startGuidedOnboarding } from '../GuidedOnboarding'

vi.mock('driver.js', () => ({
  driver: vi.fn(() => ({ drive: vi.fn(), destroy: vi.fn() })),
}))

describe('GuidedOnboarding', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('resolves supported and unsupported routes', () => {
    expect(resolveOnboardingRoute('/login')).toBe('login')
    expect(resolveOnboardingRoute('/live')).toBe('live')
    expect(resolveOnboardingRoute('/settings')).toBe('unsupported')
  })

  it('starts only the steps whose target elements are present', () => {
    document.body.innerHTML = '<div data-onboarding="login-username"></div><button data-onboarding="login-submit"></button>'

    const started = startGuidedOnboarding('login', ((key: string) => key) as never)

    expect(started).toBe(true)
    expect(driver).toHaveBeenCalledTimes(1)
    const options = vi.mocked(driver).mock.calls[0]?.[0] as { steps: Array<{ element: string }> }
    expect(options.steps.map((step) => step.element)).toEqual([
      '[data-onboarding="login-username"]',
      '[data-onboarding="login-submit"]',
    ])
  })

  it('does not start a tour when no target is available', () => {
    expect(startGuidedOnboarding('live', ((key: string) => key) as never)).toBe(false)
    expect(driver).not.toHaveBeenCalled()
  })
})
