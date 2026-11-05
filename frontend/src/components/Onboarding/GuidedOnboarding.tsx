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
