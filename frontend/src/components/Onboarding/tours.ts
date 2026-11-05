import type { TFunction } from 'i18next'

export type OnboardingScreen = 'login' | 'live'

export interface OnboardingStep {
  element: string
  title: string
  description: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  allowMissing?: boolean
  waitForElement?: number
  advanceOnClick?: boolean
}

export function getOnboardingSteps(screen: OnboardingScreen, t: TFunction): OnboardingStep[] {
  const steps = screen === 'login'
    ? [
        { element: '[data-onboarding="login-username"]', title: t('onboarding.login.usernameTitle'), description: t('onboarding.login.usernameDescription'), side: 'right' as const },
        { element: '[data-onboarding="login-password"]', title: t('onboarding.login.passwordTitle'), description: t('onboarding.login.passwordDescription'), side: 'right' as const },
        { element: '[data-onboarding="login-submit"]', title: t('onboarding.login.submitTitle'), description: t('onboarding.login.submitDescription'), side: 'top' as const },
        { element: '[data-onboarding="login-signup"]', title: t('onboarding.login.signupTitle'), description: t('onboarding.login.signupDescription'), side: 'top' as const },
      ]
    : [
        { element: '[data-onboarding="live-process-tabs"]', title: t('onboarding.live.processTitle'), description: t('onboarding.live.processDescription'), side: 'bottom' as const, align: 'start' as const },
        { element: '[data-onboarding="live-sub-tabs"]', title: t('onboarding.live.subTabTitle'), description: t('onboarding.live.subTabDescription'), side: 'bottom' as const, align: 'start' as const },
        { element: '[data-onboarding="live-empty-cell"]', title: t('onboarding.live.addVideoTitle'), description: t('onboarding.live.addVideoDescription'), side: 'top' as const, allowMissing: true, advanceOnClick: true },
        { element: '[data-onboarding="live-video-source"]', title: t('onboarding.live.selectVideoTitle'), description: t('onboarding.live.selectVideoDescription'), side: 'right' as const, allowMissing: true, waitForElement: 5000, advanceOnClick: true },
        { element: '[data-onboarding="live-grid"]', title: t('onboarding.live.videoTitle'), description: t('onboarding.live.videoDescription'), side: 'top' as const },
        { element: '[data-onboarding="live-alarm"]', title: t('onboarding.live.alarmTitle'), description: t('onboarding.live.alarmDescription'), side: 'bottom' as const },
      ]

  return steps.map((step, index) => ({ ...step, order: index + 1 }))
}
