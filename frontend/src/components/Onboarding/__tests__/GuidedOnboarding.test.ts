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
    expect(resolveOnboardingRoute('/live/cameras/101')).toBe('cameraFocus')
    expect(resolveOnboardingRoute('/playback')).toBe('playback')
    expect(resolveOnboardingRoute('/events')).toBe('events')
    expect(resolveOnboardingRoute('/settings')).toBe('settings')
    expect(resolveOnboardingRoute('/admin/users')).toBe('adminUsers')
    expect(resolveOnboardingRoute('/admin/query-management')).toBe('adminQueries')
    expect(resolveOnboardingRoute('/admin/unknown')).toBe('adminOther')
    expect(resolveOnboardingRoute('/unknown')).toBe('unsupported')
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

  it('starts the basic tour for supported application screens', () => {
    document.body.innerHTML = '<button data-onboarding="page-navigation-button"></button><main data-onboarding="page-content"></main><button data-onboarding="live-alarm"></button>'

    expect(startGuidedOnboarding('events', ((key: string) => key) as never)).toBe(true)
    const options = vi.mocked(driver).mock.calls[0]?.[0] as { steps: Array<{ element: string }> }
    expect(options.steps.map((step) => step.element)).toEqual([
      '[data-onboarding="page-navigation-button"]',
      '[data-onboarding="page-content"]',
      '[data-onboarding="live-alarm"]',
    ])
  })
})
