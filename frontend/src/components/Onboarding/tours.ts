import type { TFunction } from 'i18next'

export type OnboardingScreen = 'login' | 'live' | 'cameraFocus' | 'playback' | 'events' | 'settings' | 'adminVideos' | 'adminUsers' | 'adminCommonCodes' | 'adminQueries' | 'adminModels' | 'adminOther'

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

function screenSteps(screen: Exclude<OnboardingScreen, 'login' | 'live'>, t: TFunction): OnboardingStep[] {
  const page = (title: string, description: string): OnboardingStep => ({
    element: '[data-onboarding="page-content"]', title, description, side: 'top',
  })
  const steps: Record<typeof screen, OnboardingStep[]> = {
    cameraFocus: [page(t('onboarding.screens.cameraFocus.title'), t('onboarding.screens.cameraFocus.description'))],
    playback: [page(t('onboarding.screens.playback.title'), t('onboarding.screens.playback.description'))],
    events: [
      { element: '[data-onboarding="events-filters"]', title: t('onboarding.screens.events.title'), description: t('onboarding.screens.events.description'), side: 'bottom' },
      { element: '[data-onboarding="events-grid"]', title: t('onboarding.screens.events.title'), description: t('onboarding.screens.events.description'), side: 'top' },
    ],
    settings: [
      { element: '[data-onboarding="settings-preferences"]', title: t('onboarding.screens.settings.title'), description: t('onboarding.screens.settings.description'), side: 'top' },
      { element: '[data-onboarding="settings-save"]', title: t('onboarding.screens.settings.title'), description: t('onboarding.screens.settings.description'), side: 'top' },
    ],
    adminVideos: [
      { element: '[data-onboarding="video-management-actions"]', title: t('onboarding.screens.adminVideos.title'), description: t('onboarding.screens.adminVideos.description'), side: 'bottom' },
      { element: '[data-onboarding="video-management-grid"]', title: t('onboarding.screens.adminVideos.title'), description: t('onboarding.screens.adminVideos.description'), side: 'top' },
    ],
    adminUsers: [
      { element: '[data-onboarding="user-management-grid"]', title: t('onboarding.screens.adminUsers.title'), description: t('onboarding.screens.adminUsers.description'), side: 'top' },
      { element: '[data-onboarding="user-management-approval"]', title: t('onboarding.screens.adminUsers.title'), description: t('onboarding.screens.adminUsers.description'), side: 'right', allowMissing: true },
      { element: '[data-onboarding="user-management-role"]', title: t('onboarding.screens.adminUsers.title'), description: t('onboarding.screens.adminUsers.description'), side: 'left', allowMissing: true },
    ],
    adminCommonCodes: [
      { element: '[data-onboarding="common-code-list"]', title: t('onboarding.screens.adminCommonCodes.title'), description: t('onboarding.screens.adminCommonCodes.description'), side: 'right' },
      { element: '[data-onboarding="common-code-detail"]', title: t('onboarding.screens.adminCommonCodes.title'), description: t('onboarding.screens.adminCommonCodes.description'), side: 'left' },
    ],
    adminQueries: [
      { element: '[data-onboarding="page-content"]', title: t('onboarding.screens.adminQueries.title'), description: t('onboarding.screens.adminQueries.description'), side: 'top' },
    ],
    adminModels: [page(t('onboarding.screens.adminModels.title'), t('onboarding.screens.adminModels.description'))],
    adminOther: [page(t('onboarding.screens.adminOther.title'), t('onboarding.screens.adminOther.description'))],
  }
  return steps[screen]
}

export function getOnboardingSteps(screen: OnboardingScreen, t: TFunction): OnboardingStep[] {
  const steps = screen === 'login'
    ? [
        { element: '[data-onboarding="login-username"]', title: t('onboarding.login.usernameTitle'), description: t('onboarding.login.usernameDescription'), side: 'right' as const },
        { element: '[data-onboarding="login-password"]', title: t('onboarding.login.passwordTitle'), description: t('onboarding.login.passwordDescription'), side: 'right' as const },
        { element: '[data-onboarding="login-submit"]', title: t('onboarding.login.submitTitle'), description: t('onboarding.login.submitDescription'), side: 'top' as const },
        { element: '[data-onboarding="login-signup"]', title: t('onboarding.login.signupTitle'), description: t('onboarding.login.signupDescription'), side: 'top' as const },
      ]
    : screen === 'live'
    ? [
        { element: '[data-onboarding="live-process-tabs"]', title: t('onboarding.live.processTitle'), description: t('onboarding.live.processDescription'), side: 'bottom' as const, align: 'start' as const },
        { element: '[data-onboarding="live-sub-tabs"]', title: t('onboarding.live.subTabTitle'), description: t('onboarding.live.subTabDescription'), side: 'bottom' as const, align: 'start' as const },
        { element: '[data-onboarding="live-empty-cell"]', title: t('onboarding.live.addVideoTitle'), description: t('onboarding.live.addVideoDescription'), side: 'top' as const, allowMissing: true, advanceOnClick: true },
        { element: '[data-onboarding="live-video-source"]', title: t('onboarding.live.selectVideoTitle'), description: t('onboarding.live.selectVideoDescription'), side: 'right' as const, allowMissing: true, waitForElement: 5000, advanceOnClick: true },
        { element: '[data-onboarding="live-grid"]', title: t('onboarding.live.videoTitle'), description: t('onboarding.live.videoDescription'), side: 'top' as const },
        { element: '[data-onboarding="live-alarm"]', title: t('onboarding.live.alarmTitle'), description: t('onboarding.live.alarmDescription'), side: 'bottom' as const },
      ]
    : screenSteps(screen, t)

  return steps.map((step, index) => ({ ...step, order: index + 1 }))
}
