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
  const steps = configuredSteps.filter((step) => {
    if (step.requires && !document.querySelector(step.requires)) return false
    return Boolean(document.querySelector(step.element)) || Boolean(step.allowMissing)
  })

  const onboarding = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayClickBehavior: 'close',
    overlayOpacity: 0.55,
    stagePadding: 8,
    stageRadius: 10,
    nextBtnText: t('onboarding.next'),
    prevBtnText: t('onboarding.previous'),
    doneBtnText: t('onboarding.done'),
    progressText: t('onboarding.progress'),
    steps: steps.map((step) => ({
      element: step.element,
      skipMissingElement: step.allowMissing,
      waitForElement: step.waitForElement,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: step.align ?? 'center',
        showButtons: step.showButtons,
        onNextClick: step.skipNextIfMissing || step.autoOpen
          ? (_element, _nextStep, opts) => {
              if (step.autoOpen) {
                const trigger = document.querySelector(`${step.autoOpen} > button`)
                if (trigger instanceof HTMLButtonElement && trigger.getAttribute('aria-expanded') === 'true') trigger.click()
              }
              if (!step.skipNextIfMissing || document.querySelector(step.skipNextIfMissing)) {
                opts.driver.moveNext()
                return
              }
              opts.driver.moveTo((opts.index ?? 0) + 2)
            }
          : undefined,
        onPopoverRender: step.autoOpen || step.advanceOnAction
          ? (_popover, opts) => {
              if (step.autoOpen) {
                const trigger = document.querySelector(`${step.autoOpen} > button`)
                if (trigger instanceof HTMLButtonElement && trigger.getAttribute('aria-expanded') !== 'true') trigger.click()
              }
              if (!step.advanceOnAction) return
              const eventName = step.actionEvent ?? 'click'
              const handleAction = (event: MouseEvent) => {
                const target = event.target instanceof Element ? event.target.closest(step.element) : null
                if (!target) return
                document.removeEventListener(eventName, handleAction, true)
                window.setTimeout(() => opts.driver.moveNext(), 50)
              }
              document.addEventListener(eventName, handleAction, true)
            }
          : undefined,
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
