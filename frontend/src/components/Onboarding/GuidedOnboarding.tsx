import { driver } from 'driver.js'
import type { TFunction } from 'i18next'
import { getOnboardingSteps, type OnboardingScreen } from './tours'
import 'driver.js/dist/driver.css'

export type { OnboardingScreen } from './tours'

export type OnboardingRoute = OnboardingScreen | 'unsupported'

let activeOnboarding: ReturnType<typeof driver> | null = null

export function resolveOnboardingRoute(pathname: string): OnboardingRoute {
  if (pathname === '/login') return 'login'
  if (pathname === '/live') return 'live'
  if (pathname.startsWith('/live/cameras/')) return 'cameraFocus'
  if (pathname === '/playback') return 'playback'
  if (pathname === '/events') return 'events'
  if (pathname === '/settings') return 'settings'
  if (pathname === '/admin/videos') return 'adminVideos'
  if (pathname === '/admin/users') return 'adminUsers'
  if (pathname === '/admin/common-codes') return 'adminCommonCodes'
  if (pathname === '/admin/query-management') return 'adminQueries'
  if (pathname === '/admin/model-management' || pathname === '/admin/model-restart') return 'adminModels'
  if (pathname.startsWith('/admin/')) return 'adminOther'
  return 'unsupported'
}

export function startGuidedOnboarding(screen: OnboardingScreen, t: TFunction): boolean {
  stopGuidedOnboarding()
  const configuredSteps = getOnboardingSteps(screen, t)
  if (!configuredSteps.some((step) => document.querySelector(step.element))) return false
  const steps = configuredSteps.filter((step) => step.allowMissing || document.querySelector(step.element))

  const onboarding = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayClickBehavior: 'close',
    nextBtnText: t('onboarding.next'),
    prevBtnText: t('onboarding.previous'),
    doneBtnText: t('onboarding.done'),
    progressText: t('onboarding.progress'),
    steps: steps.map((step) => ({
      element: step.element,
      skipMissingElement: step.allowMissing,
      waitForElement: step.waitForElement,
      advanceOnClick: step.advanceOnClick,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: step.align ?? 'center',
      },
    })),
  })

  activeOnboarding = onboarding
  onboarding.drive()
  return true
}

export function stopGuidedOnboarding(): void {
  activeOnboarding?.destroy()
  activeOnboarding = null
}
