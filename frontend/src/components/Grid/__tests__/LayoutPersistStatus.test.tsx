import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import layoutReducer, { fetchMyLayout, saveMyLayout } from '@/store/slices/layoutSlice'
import { createMockLayout } from '@/mocks/liveMonitoring'
import LayoutPersistStatus from '../LayoutPersistStatus'

function renderStatus(store: ReturnType<typeof createStore>) {
  return render(<Provider store={store}><LayoutPersistStatus /></Provider>)
}

function createStore() {
  return configureStore({ reducer: { layout: layoutReducer } })
}

describe('LayoutPersistStatus', () => {
  afterEach(() => vi.useRealTimers())

  it('does not show a toast just because the saved layout was restored', () => {
    const store = createStore()
    store.dispatch(fetchMyLayout.fulfilled({ layout: createMockLayout(), username: 'tester' }, '', 'tester'))

    renderStatus(store)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows pending and saving feedback, then briefly confirms success', () => {
    vi.useFakeTimers()
    const store = createStore()
    const layout = createMockLayout()
    store.dispatch(fetchMyLayout.fulfilled({ layout, username: 'tester' }, '', 'tester'))
    store.dispatch(saveMyLayout.pending('request-1', layout))

    renderStatus(store)
    expect(screen.getByRole('status')).toHaveTextContent('레이아웃 저장 중')

    act(() => store.dispatch(saveMyLayout.fulfilled(layout, 'request-1', layout)))
    expect(screen.getByRole('status')).toHaveTextContent('레이아웃 저장됨')

    act(() => vi.advanceTimersByTime(1800))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps save errors visible until the state changes', () => {
    const store = createStore()
    store.dispatch(saveMyLayout.rejected(new Error('Network unavailable'), 'request-1', createMockLayout()))

    renderStatus(store)

    expect(screen.getByRole('alert')).toHaveTextContent('레이아웃 저장 실패')
    expect(screen.getByRole('alert')).toHaveTextContent('Network unavailable')
  })
})
