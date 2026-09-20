import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { Settings } from '@/pages/Settings'

const { get, save } = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }))
vi.mock('@/services/userAlertPreferenceService', () => ({
  userAlertPreferenceService: { get, save },
}))

describe('Settings', () => {
  const renderSettings = () => render(<I18nextProvider i18n={i18n}><Settings /></I18nextProvider>)

  beforeEach(() => {
    vi.clearAllMocks()
    get.mockResolvedValue({ email: 'operator@example.com', phone: '01012345678', emailEnabled: false, smsEnabled: false })
    save.mockImplementation(async (input) => ({ email: 'operator@example.com', phone: '01012345678', ...input }))
  })

  it('shows account contacts read-only and persists notification preferences', async () => {
    renderSettings()

    const email = await screen.findByDisplayValue('operator@example.com')
    expect(email).toHaveAttribute('readonly')
    expect(screen.getByDisplayValue('01012345678')).toHaveAttribute('readonly')

    fireEvent.click(screen.getByLabelText('Email notifications'))
    const saveButton = screen.getByRole('button', { name: 'Save' })
    await waitFor(() => expect(saveButton).toBeEnabled())
    fireEvent.click(saveButton)

    await waitFor(() => expect(save).toHaveBeenCalledWith({ emailEnabled: true, smsEnabled: false }))
  })

  it('prevents enabling an alert channel when its contact is missing', async () => {
    get.mockResolvedValue({ email: null, phone: null, emailEnabled: false, smsEnabled: false })
    renderSettings()

    expect(await screen.findByLabelText('Email notifications')).toBeDisabled()
    expect(screen.getByLabelText('SMS alerts')).toBeDisabled()
  })
})
