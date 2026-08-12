import { describe, expect, it } from 'vitest'
import uiReducer, { setThemeMode, toggleTheme } from '../uiSlice'

describe('uiSlice', () => {
  it('sets one of the three presentation themes', () => {
    const state = uiReducer(undefined, setThemeMode('theme3'))

    expect(state.themeMode).toBe('theme3')
  })

  it('cycles through all presentation themes', () => {
    const theme1State = uiReducer(undefined, setThemeMode('theme1'))
    const theme2State = uiReducer(theme1State, toggleTheme())
    const theme3State = uiReducer(theme2State, toggleTheme())
    const nextTheme1State = uiReducer(theme3State, toggleTheme())

    expect(theme2State.themeMode).toBe('theme2')
    expect(theme3State.themeMode).toBe('theme3')
    expect(nextTheme1State.themeMode).toBe('theme1')
  })
})
