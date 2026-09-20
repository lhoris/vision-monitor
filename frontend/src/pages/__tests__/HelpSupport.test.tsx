import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { HelpSupport } from '@/pages/HelpSupport'

describe('HelpSupport', () => {
  it('shows the guide, FAQ, and actual build information without inventing support details', () => {
    render(<I18nextProvider i18n={i18n}><HelpSupport /></I18nextProvider>)
    expect(screen.getByText(/Quick Guide|빠른 사용 안내/)).toBeInTheDocument()
    expect(screen.getByText(/A video stream will not play|영상이 재생되지 않아요/)).toBeInTheDocument()
    expect(screen.getByText(import.meta.env.VITE_APP_VERSION || '0.0.1')).toBeInTheDocument()
    expect(screen.queryByText(/Support Contact|지원 연락처/)).not.toBeInTheDocument()
  })
})
