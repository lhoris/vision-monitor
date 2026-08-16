import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { Sidebar } from '../Sidebar'
import { store } from '@/store'
import i18n from '@/i18n'
import { loginUser, logout } from '@/store/slices/authSlice'
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

  it('shows admin menu groups for the tester admin account', () => {
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
    expect(screen.getByText('통신 및 모델 수정')).toBeInTheDocument()
    expect(screen.getByText('모니터링 통신 현황')).toBeInTheDocument()
    expect(screen.getByText('제어 연동 통신 현황')).toBeInTheDocument()
    expect(screen.getByText('기타 주소 설정 현황')).toBeInTheDocument()
    expect(screen.getByText('모델 재가동')).toBeInTheDocument()
    expect(screen.getByText('영상 모델 추가')).toBeInTheDocument()
    expect(screen.getByText('접속 권한 관리')).toBeInTheDocument()
    expect(screen.getByText('사용자 관리')).toBeInTheDocument()
    expect(screen.getByText('역할 관리')).toBeInTheDocument()
    expect(screen.getByText('권한 정책 관리')).toBeInTheDocument()
    expect(screen.getByText('메뉴 접근 권한 관리')).toBeInTheDocument()
    expect(screen.queryByText('화면 수정')).not.toBeInTheDocument()
    expect(screen.queryByText('공정 추가')).not.toBeInTheDocument()
    expect(screen.queryByText('세부 공정 수정')).not.toBeInTheDocument()
    expect(screen.queryByText('화면 배치 수정')).not.toBeInTheDocument()
  })

  it('hides admin menu groups for non-admin users', () => {
    store.dispatch(
      loginUser.fulfilled(
        {
          user: {
            id: 2,
            username: 'operator',
            role: 'operator',
            permissions: [],
          },
          token: 'operator-token',
        },
        'request-id',
        { username: 'operator', password: 'secret' }
      )
    )

    renderSidebar()

    expect(screen.getByText('라이브')).toBeInTheDocument()
    expect(screen.getByText('녹화')).toBeInTheDocument()
    expect(screen.getByText('이벤트')).toBeInTheDocument()
    expect(screen.queryByText('관리자 메뉴')).not.toBeInTheDocument()
    expect(screen.queryByText('통신 및 모델 수정')).not.toBeInTheDocument()
    expect(screen.queryByText('접속 권한 관리')).not.toBeInTheDocument()
    expect(screen.queryByText('사용자 관리')).not.toBeInTheDocument()
  })
})

