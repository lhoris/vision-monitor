import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecordingControls } from '../RecordingControls'

describe('RecordingControls', () => {
  it('edits the range and submits a recording query', () => {
    const onChange = vi.fn()
    const onSubmit = vi.fn()

    render(
      <RecordingControls
        range={{ from: '2026-11-17T07:29:31', to: '2026-11-17T07:30:01' }}
        loading={false}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    )

    fireEvent.change(screen.getByLabelText('시작 시각'), { target: { value: '2026-11-17T07:29:40' } })
    fireEvent.click(screen.getByRole('button', { name: '녹화 조회' }))

    expect(onChange).toHaveBeenCalledWith({ from: '2026-11-17T07:29:40.000', to: '2026-11-17T07:30:01', eventId: undefined })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows an invalid range message', () => {
    render(
      <RecordingControls
        range={{ from: '2026-11-17T07:30:01', to: '2026-11-17T07:29:31' }}
        loading={false}
        error="INVALID_RANGE"
        onChange={() => undefined}
        onSubmit={() => undefined}
      />
    )

    expect(screen.getByText('시작 시각은 종료 시각보다 빨라야 합니다.')).toBeInTheDocument()
  })
})
