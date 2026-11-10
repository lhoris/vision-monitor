import { driver } from 'driver.js'
import type { TFunction } from 'i18next'
import { getOnboardingSteps, type OnboardingScreen } from './tours'
import 'driver.js/dist/driver.css'

export type { OnboardingScreen } from './tours'

export type OnboardingRoute = OnboardingScreen | 'unsupported'

let activeOnboarding: ReturnType<typeof driver> | null = null
let activeActionCleanup: (() => void) | null = null
let suppressActionAdvance = false

function moveNextWhenReady(driverInstance: { moveNext: () => void }, selector: string): void {
  const deadline = Date.now() + 1000
  const move = () => {
    if (document.querySelector(selector) || Date.now() >= deadline) {
      driverInstance.moveNext()
      return
    }
    window.setTimeout(move, 25)
  }
  move()
}

function openContextMenu(selector: string): void {
  const target = document.querySelector(selector)
  if (!(target instanceof HTMLElement)) return

  const rect = target.getBoundingClientRect()
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: rect.left + Math.min(rect.width / 2, 160),
    clientY: rect.top + Math.min(rect.height / 2, 24),
  }) as MouseEvent & { onboardingAuto?: boolean }
  event.onboardingAuto = true
  target.dispatchEvent(event)
}

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
    nextBtnText: `${t('onboarding.next')} ›`,
    prevBtnText: `‹ ${t('onboarding.previous')}`,
    doneBtnText: t('onboarding.done'),
    progressText: t('onboarding.progress'),
    onNextClick: (_element, _step, opts) => opts.driver.moveNext(),
    onPrevClick: (_element, _step, opts) => opts.driver.movePrevious(),
    steps: steps.map((step) => ({
      element: step.element,
      skipMissingElement: step.allowMissing && !step.waitForElement,
      waitForElement: step.waitForElement,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: step.align ?? 'center',
        showButtons: step.showButtons,
        onNextClick: step.skipNextIfMissing || step.autoAction || step.autoSelect || step.openOnNext || step.closeOnNext
          ? (_element, _nextStep, opts) => {
              if (step.closeOnNext) {
                const closeTarget = document.querySelector(step.closeOnNext)
                if (closeTarget instanceof HTMLElement) closeTarget.click()
              }
              if (step.autoSelect) {
                const selectTarget = document.querySelector(step.autoSelect)
                if (selectTarget instanceof HTMLElement) {
                  selectTarget.click()
                  return
                }
                opts.driver.moveNext()
                return
              }
              if (step.autoAction && step.skipNextIfMissing && !document.querySelector(step.skipNextIfMissing)) {
                const actionTarget = document.querySelector(step.autoAction)
                if (actionTarget instanceof HTMLElement) {
                  actionTarget.click()
                  return
                }
              }
              if (step.openOnNext) {
                if (step.element === '[data-onboarding="live-video-titlebar"]') {
                  openContextMenu(step.openOnNext)
                  moveNextWhenReady(opts.driver, '[data-onboarding="live-video-context-menu"]')
                  return
                } else {
                  const trigger = document.querySelector(`${step.openOnNext} > button`)
                  if (trigger instanceof HTMLButtonElement && trigger.getAttribute('aria-expanded') !== 'true') {
                    suppressActionAdvance = true
                    trigger.click()
                    suppressActionAdvance = false
                  }
                  moveNextWhenReady(opts.driver, '[data-onboarding="live-grid-layout-menu"]')
                  return
                }
              }
              if (!step.skipNextIfMissing || document.querySelector(step.skipNextIfMissing)) {
                opts.driver.moveNext()
                return
              }
              opts.driver.moveTo((opts.index ?? 0) + 2)
            }
          : undefined,
        onPrevClick: step.closeOnPrevious || step.openOnPrevious
          ? (_element, _previousStep, opts) => {
              if (step.closeOnPrevious) {
                const closeTarget = document.querySelector(step.closeOnPrevious)
                if (closeTarget instanceof HTMLElement) closeTarget.click()
              }
              if (step.openOnPrevious) {
                if (step.element === '[data-onboarding="live-grid-layout"]') {
                  openContextMenu(step.openOnPrevious)
                } else {
                  const trigger = document.querySelector(step.openOnPrevious)
                  if (trigger instanceof HTMLElement) {
                    trigger.click()
                  } else {
                    return
                  }
                }
                window.setTimeout(() => opts.driver.movePrevious(), 50)
                return
              }
              opts.driver.movePrevious()
            }
          : undefined,
        onPopoverRender: step.autoContextMenu || step.advanceOnAction
          ? (_popover, opts) => {
              activeActionCleanup?.()
              activeActionCleanup = null
              if (step.autoContextMenu) openContextMenu(step.autoContextMenu)
              if (!step.advanceOnAction) return
              const eventName = step.actionEvent ?? 'click'
              const handleAction = (event: MouseEvent) => {
                if ((event as MouseEvent & { onboardingAuto?: boolean }).onboardingAuto) return
                if (suppressActionAdvance) return
                const target = event.target instanceof Element ? event.target.closest(step.element) : null
                if (!target) return
                activeActionCleanup?.()
                activeActionCleanup = null
                window.setTimeout(() => opts.driver.moveNext(), 50)
              }
              document.addEventListener(eventName, handleAction, true)
              activeActionCleanup = () => document.removeEventListener(eventName, handleAction, true)
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
  activeActionCleanup?.()
  activeActionCleanup = null
  activeOnboarding?.destroy()
  activeOnboarding = null
}
