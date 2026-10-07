import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import authReducer from '@/store/slices/authSlice'
import { ACTIVE_LOGIN_TEMPLATE, Login } from '../Login'

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

function renderLogin() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  )
}

describe('Login', () => {
  it('uses login template 2 by default', () => {
    expect(ACTIVE_LOGIN_TEMPLATE).toBe(2)
  })

  it('keeps demo credentials and prefilled tester account', () => {
    renderLogin()

    expect(screen.getByLabelText('USER ID')).toHaveValue('tester')
    expect(screen.getByLabelText('PASSWORD')).toHaveValue('tester1@#')
    expect(screen.getByLabelText('Demo Credentials')).toHaveTextContent('tester')
    expect(screen.getByLabelText('Demo Credentials')).toHaveTextContent('tester1@#')
  })

  it('toggles the password visibility without changing the entered value', () => {
    renderLogin()

    const password = screen.getByLabelText('PASSWORD')
    expect(password).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(password).toHaveValue('tester1@#')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password).toHaveAttribute('type', 'password')
  })
})
