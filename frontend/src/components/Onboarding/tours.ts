import type { TFunction } from 'i18next'

export type OnboardingScreen = 'login' | 'live' | 'cameraFocus' | 'playback' | 'events' | 'settings' | 'adminVideos' | 'adminUsers' | 'adminCommonCodes' | 'adminQueries' | 'adminModels' | 'adminOther'

export interface OnboardingStep {
  element: string
  title: string
  description: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  allowMissing?: boolean
  requires?: string
  waitForElement?: number
  advanceOnAction?: boolean
  actionEvent?: 'click' | 'contextmenu'
  showButtons?: Array<'next' | 'previous' | 'close'>
  skipNextIfMissing?: string
  autoAction?: string
  openOnNext?: string
  autoContextMenu?: string
  closeOnNext?: string
  closeOnPrevious?: string
}

function screenSteps(screen: Exclude<OnboardingScreen, 'login' | 'live'>, t: TFunction): OnboardingStep[] {
  const page = (title: string, description: string): OnboardingStep => ({
    element: '[data-onboarding="page-content"]', title, description, side: 'top',
  })
  const steps: Record<typeof screen, OnboardingStep[]> = {
    cameraFocus: [
      { element: '[data-onboarding="camera-focus-cameras"]', title: t('onboarding.screens.cameraFocus.camerasTitle'), description: t('onboarding.screens.cameraFocus.camerasDescription'), side: 'bottom' },
      { element: '[data-onboarding="camera-focus-mode"]', title: t('onboarding.screens.cameraFocus.modeTitle'), description: t('onboarding.screens.cameraFocus.modeDescription'), side: 'bottom' },
      { element: '[data-onboarding="camera-focus-content"]', title: t('onboarding.screens.cameraFocus.contentTitle'), description: t('onboarding.screens.cameraFocus.contentDescription'), side: 'top' },
    ],
    playback: [
      { element: '[data-onboarding="playback-settings"]', title: t('onboarding.screens.playback.settingsTitle'), description: t('onboarding.screens.playback.settingsDescription'), side: 'left' },
      { element: '[data-onboarding="playback-player"]', title: t('onboarding.screens.playback.playerTitle'), description: t('onboarding.screens.playback.playerDescription'), side: 'top' },
    ],
    events: [
      { element: '[data-onboarding="events-filters"]', title: t('onboarding.screens.events.filtersTitle'), description: t('onboarding.screens.events.filtersDescription'), side: 'bottom' },
      { element: '[data-onboarding="events-grid"]', title: t('onboarding.screens.events.gridTitle'), description: t('onboarding.screens.events.gridDescription'), side: 'top' },
    ],
    settings: [
      { element: '[data-onboarding="settings-preferences"]', title: t('onboarding.screens.settings.preferencesTitle'), description: t('onboarding.screens.settings.preferencesDescription'), side: 'top' },
      { element: '[data-onboarding="settings-save"]', title: t('onboarding.screens.settings.saveTitle'), description: t('onboarding.screens.settings.saveDescription'), side: 'top' },
    ],
    adminVideos: [
      { element: '[data-onboarding="video-management-actions"]', title: t('onboarding.screens.adminVideos.actionsTitle'), description: t('onboarding.screens.adminVideos.actionsDescription'), side: 'bottom' },
      { element: '[data-onboarding="video-management-grid"]', title: t('onboarding.screens.adminVideos.gridTitle'), description: t('onboarding.screens.adminVideos.gridDescription'), side: 'top' },
    ],
    adminUsers: [
      { element: '[data-onboarding="user-management-grid"]', title: t('onboarding.screens.adminUsers.accountTitle'), description: t('onboarding.screens.adminUsers.accountDescription'), side: 'top' },
      { element: '[data-onboarding="user-management-approval"]', title: t('onboarding.screens.adminUsers.approvalTitle'), description: t('onboarding.screens.adminUsers.approvalDescription'), side: 'right', allowMissing: true },
      { element: '[data-onboarding="user-management-role"]', title: t('onboarding.screens.adminUsers.roleTitle'), description: t('onboarding.screens.adminUsers.roleDescription'), side: 'left', allowMissing: true },
    ],
    adminCommonCodes: [
      { element: '[data-onboarding="common-code-list"]', title: t('onboarding.screens.adminCommonCodes.listTitle'), description: t('onboarding.screens.adminCommonCodes.listDescription'), side: 'right' },
      { element: '[data-onboarding="common-code-detail"]', title: t('onboarding.screens.adminCommonCodes.detailTitle'), description: t('onboarding.screens.adminCommonCodes.detailDescription'), side: 'left' },
    ],
    adminQueries: [
      { element: '[data-onboarding="page-content"]', title: t('onboarding.screens.adminQueries.managementTitle'), description: t('onboarding.screens.adminQueries.managementDescription'), side: 'top' },
    ],
    adminModels: [
      { element: '[data-onboarding="model-management-page"]', title: t('onboarding.screens.adminModels.dashboardTitle'), description: t('onboarding.screens.adminModels.dashboardDescription'), side: 'top' },
      { element: '[data-onboarding="page-content"]', title: t('onboarding.screens.adminModels.viewTitle'), description: t('onboarding.screens.adminModels.viewDescription'), side: 'top' },
    ],
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
        { element: '[data-onboarding="live-empty-cell"]', title: t('onboarding.live.addVideoTitle'), description: t('onboarding.live.addVideoDescription'), side: 'top' as const, advanceOnAction: true, autoAction: '[data-onboarding="live-empty-cell"]', skipNextIfMissing: '[data-onboarding="live-video-source"]', showButtons: ['previous', 'next', 'close'] as Array<'previous' | 'next' | 'close'> },
        { element: '[data-onboarding="live-video-source"]', title: t('onboarding.live.selectVideoTitle'), description: t('onboarding.live.selectVideoDescription'), side: 'right' as const, allowMissing: true, requires: '[data-onboarding="live-empty-cell"]', waitForElement: 5000, advanceOnAction: true, showButtons: ['previous', 'next', 'close'] as Array<'previous' | 'next' | 'close'> },
        { element: '[data-onboarding="live-grid"]', title: t('onboarding.live.videoTitle'), description: t('onboarding.live.videoDescription'), side: 'top' as const },
        { element: '[data-onboarding="live-video-titlebar"]', title: t('onboarding.live.titleBarTitle'), description: t('onboarding.live.titleBarDescription'), side: 'bottom' as const, openOnNext: '[data-onboarding="live-video-titlebar"]', skipNextIfMissing: '[data-onboarding="live-video-context-menu"]', showButtons: ['previous', 'next', 'close'] as Array<'previous' | 'next' | 'close'> },
        { element: '[data-onboarding="live-video-context-menu"]', title: t('onboarding.live.contextMenuTitle'), description: t('onboarding.live.contextMenuDescription'), side: 'right' as const, allowMissing: true, requires: '[data-onboarding="live-video-titlebar"]', waitForElement: 5000, closeOnNext: '[data-onboarding="live-video-context-menu-overlay"]', closeOnPrevious: '[data-onboarding="live-video-context-menu-overlay"]' },
        { element: '[data-onboarding="live-grid-layout"]', title: t('onboarding.live.layoutTitle'), description: t('onboarding.live.layoutDescription'), side: 'bottom' as const, openOnNext: '[data-onboarding="live-grid-layout"]', showButtons: ['previous', 'next', 'close'] as Array<'previous' | 'next' | 'close'> },
        { element: '[data-onboarding="live-grid-layout-menu"]', title: t('onboarding.live.layoutTitle'), description: t('onboarding.live.layoutDescription'), side: 'bottom' as const, allowMissing: true, requires: '[data-onboarding="live-grid-layout"]', waitForElement: 5000, closeOnNext: '[data-onboarding="live-grid-layout-overlay"]', closeOnPrevious: '[data-onboarding="live-grid-layout-overlay"]' },
      ]
    : screenSteps(screen, t)

  return steps.map((step, index) => ({ ...step, order: index + 1 }))
}
