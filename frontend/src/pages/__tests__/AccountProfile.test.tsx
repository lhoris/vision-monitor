import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { authService } from '@/services/authService'
import { AccountProfile } from '@/pages/AccountProfile'

vi.mock('@/services/authService', () => ({ authService: { getMyProfile: vi.fn(), changePassword: vi.fn() } }))

function renderProfile() {
  const store = configureStore({ reducer: { auth: (state = { user: { username: 'tester' } }) => state } })
  return render(<Provider store={store}><I18nextProvider i18n={i18n}><MemoryRouter><AccountProfile /></MemoryRouter></I18nextProvider></Provider>)
}

describe('AccountProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.getMyProfile).mockResolvedValue({ id: 4, username: 'tester', name: 'Test User', role: 'admin', email: 'tester@example.com', phone: '01012345678' })
    vi.mocked(authService.changePassword).mockResolvedValue()
  })

  it('loads identity from the authenticated self-profile API', async () => {
    renderProfile()
    expect(await screen.findByText('tester')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(authService.getMyProfile).toHaveBeenCalledOnce()
  })

  it('validates confirmation and changes password through the backend service', async () => {
    renderProfile()
    await screen.findByText('tester')
    const inputs = screen.getAllByLabelText(/Password/i)
    fireEvent.change(inputs[0], { target: { value: 'old-password' } })
    fireEvent.change(inputs[1], { target: { value: 'new-password-1' } })
    fireEvent.change(inputs[2], { target: { value: 'different-password' } })
    fireEvent.click(screen.getByRole('button', { name: /Update Password|비밀번호 변경/ }))
    expect(await screen.findByText(/do not match|일치하지 않습니다/)).toBeInTheDocument()
    expect(authService.changePassword).not.toHaveBeenCalled()

    fireEvent.change(inputs[2], { target: { value: 'new-password-1' } })
    fireEvent.click(screen.getByRole('button', { name: /Update Password|비밀번호 변경/ }))
    await waitFor(() => expect(authService.changePassword).toHaveBeenCalledWith('new-password-1', 'old-password'))
  })

  it('shows a useful error when profile loading fails', async () => {
    vi.mocked(authService.getMyProfile).mockRejectedValue(new Error('unavailable'))
    renderProfile()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('shows the backend validation message when the current password is incorrect', async () => {
    vi.mocked(authService.changePassword).mockRejectedValue({ code: 'CURRENT_PASSWORD_INVALID', message: '현재 비밀번호가 올바르지 않습니다.' })
    renderProfile()
    await screen.findByText('tester')
    fireEvent.change(screen.getByLabelText(/Current Password|현재 비밀번호/), { target: { value: 'wrong-password' } })
    fireEvent.change(screen.getByLabelText(/^New Password$/), { target: { value: 'new-password-1' } })
    fireEvent.change(screen.getByLabelText(/Confirm New Password|새 비밀번호 확인/), { target: { value: 'new-password-1' } })
    fireEvent.click(screen.getByRole('button', { name: /Update Password|비밀번호 변경/ }))
    expect(await screen.findByText('현재 비밀번호가 올바르지 않습니다.')).toBeInTheDocument()
  })
})
