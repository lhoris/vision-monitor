import { render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { Sidebar } from '../Sidebar'
import { store } from '@/store'
import i18n from '@/i18n'
import { loginUser, logout } from '@/store/slices/authSlice'
import { mergeCommonCodes } from '@/store/slices/commonCodeSlice'
import { setSidebarOpen } from '@/store/slices/uiSlice'

function renderSidebar() {
  return render(
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <MemoryRouter initialEntries={['/live']}>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    </I18nextProvider>
  )
}

describe('Sidebar admin navigation', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko')
    store.dispatch(logout())
    store.dispatch(setSidebarOpen(true))
  })

  it('shows only the retained admin menu items for the tester admin account', () => {
    store.dispatch(
      loginUser.fulfilled(
        {
          user: {
            id: 1,
            username: 'tester',
            role: 'admin',
            permissions: ['admin:access'],
          },
          token: 'mock-tester-token',
        },
        'request-id',
        { username: 'tester', password: 'tester123' }
      )
    )

    renderSidebar()

    expect(screen.getByText('관리자 메뉴')).toBeInTheDocument()
    const communicationGroup = within(screen.getByRole('group', { name: '통신 및 모델 설정' }))
    const systemGroup = within(screen.getByRole('group', { name: '시스템 관리' }))
    expect(communicationGroup.getByText('모델 관리')).toBeInTheDocument()
    expect(communicationGroup.getByText('영상 관리')).toBeInTheDocument()
    expect(communicationGroup.queryByText('공통코드 관리')).not.toBeInTheDocument()
    expect(systemGroup.getByText('사용자 관리')).toBeInTheDocument()
    expect(systemGroup.getByText('공통코드 관리')).toBeInTheDocument()

    expect(screen.queryByText('모니터링 통신 현황')).not.toBeInTheDocument()
    expect(screen.queryByText('제어 연동 통신 현황')).not.toBeInTheDocument()
    expect(screen.queryByText('기타 주소 설정 현황')).not.toBeInTheDocument()
    expect(screen.queryByText('모델 재가동')).not.toBeInTheDocument()
    expect(screen.queryByText('역할 관리')).not.toBeInTheDocument()
    expect(screen.queryByText('권한 정책 관리')).not.toBeInTheDocument()
    expect(screen.queryByText('메뉴 접근 권한 관리')).not.toBeInTheDocument()
  })

  it('restores admin navigation when the session returns uppercase role and permission codes', () => {
    store.dispatch(
      loginUser.fulfilled(
        {
          user: {
            id: 1,
            username: 'admin',
            role: 'ADMIN',
            permissions: ['ADMIN:ACCESS'],
          },
          token: 'admin-session-token',
        },
        'request-id',
        { username: 'admin', password: 'admin' }
      )
    )

    renderSidebar()

    expect(screen.getByText('관리자 메뉴')).toBeInTheDocument()
    expect(screen.getByText('모델 관리')).toBeInTheDocument()
    expect(screen.getByText('사용자 관리')).toBeInTheDocument()
  })

  it('uses APP_BRANDING common code values for the sidebar title', () => {
    store.dispatch(mergeCommonCodes({
      version: 'test-branding',
      codes: {
        APP_BRANDING: {
          code: 'APP_BRANDING',
          description: 'Application branding labels',
          type: 'SYSTEM',
          items: [
            { id: 1, value: 'APP_TITLE', name: '공통코드 타이틀', nameKo: '공통코드 타이틀', nameEn: 'Common Code Title', sortOrder: 10 },
            { id: 2, value: 'APP_SUBTITLE', name: '공통코드 부제목', nameKo: '공통코드 부제목', nameEn: 'Common Code Subtitle', sortOrder: 20 },
          ],
        },
      },
    }))

    store.dispatch(
      loginUser.fulfilled(
        {
          user: {
            id: 1,
            username: 'tester',
            role: 'admin',
            permissions: ['admin:access'],
          },
          token: 'mock-tester-token',
        },
        'request-id',
        { username: 'tester', password: 'tester123' }
      )
    )

    renderSidebar()

    expect(screen.getByText('공통코드 타이틀')).toBeInTheDocument()
    expect(screen.getByText('공통코드 부제목')).toBeInTheDocument()
    expect(screen.queryByText('AI 영상통합 플랫폼')).not.toBeInTheDocument()
    expect(screen.queryByText('포항 4선재')).not.toBeInTheDocument()
  })

  it('hides admin menu groups for the tester1 non-admin account', () => {
    store.dispatch(
      loginUser.fulfilled(
        {
          user: {
            id: 2,
            username: 'tester1',
            role: 'operator',
            permissions: [],
          },
          token: 'mock-tester1-token',
        },
        'request-id',
        { username: 'tester1', password: 'tester123' }
      )
    )

    renderSidebar()

    expect(screen.getByText('라이브')).toBeInTheDocument()
    expect(screen.queryByText('녹화')).not.toBeInTheDocument()
    expect(screen.getByText('알람')).toBeInTheDocument()
    expect(screen.queryByText('관리자 메뉴')).not.toBeInTheDocument()
    expect(screen.queryByText('통신 및 모델 설정')).not.toBeInTheDocument()
    expect(screen.queryByText('시스템 관리')).not.toBeInTheDocument()
    expect(screen.queryByText('사용자 관리')).not.toBeInTheDocument()
  })
})
