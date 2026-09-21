import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LayoutSelector } from '../LayoutSelector'

const options = [
  { rows: 2, cols: 3, label: '2x3' },
  { rows: 2, cols: 4, label: '2x4' },
  { rows: 3, cols: 3, label: '3x3' },
  { rows: 3, cols: 4, label: '3x4' },
  { rows: 4, cols: 4, label: '4x4' },
  { rows: 4, cols: 5, label: '4x5' },
]

describe('LayoutSelector', () => {
  it('previews a hovered grid size and applies it on click', () => {
    const onLayoutChange = vi.fn()
    render(<LayoutSelector currentLayout="2x2" options={options} onLayoutChange={onLayoutChange} />)

    fireEvent.click(screen.getByRole('button', { name: /Grid: 2x2/ }))
    fireEvent.click(screen.getByRole('button', { name: '사용자 지정' }))
    const option = screen.getByRole('button', { name: '3행 4열 레이아웃' })
    fireEvent.mouseEnter(option)

    expect(screen.getByText('3 × 4')).toBeInTheDocument()
    fireEvent.click(option)

    expect(onLayoutChange).toHaveBeenCalledWith({ rows: 3, cols: 4, label: '3x4' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('limits the grid picker to 5 rows and 6 columns', () => {
    render(<LayoutSelector currentLayout="2x2" options={options} onLayoutChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Grid: 2x2/ }))
    fireEvent.click(screen.getByRole('button', { name: '사용자 지정' }))

    expect(screen.getByRole('button', { name: '5행 6열 레이아웃' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '6행 1열 레이아웃' })).not.toBeInTheDocument()
  })

  it('keeps the sorted presets, including 3x4 and 4x5 while excluding 3x2 and 4x2', () => {
    render(<LayoutSelector currentLayout="3x4" options={options} onLayoutChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Grid: 3x4/ }))

    expect(screen.getByRole('button', { name: '3행 4열 프리셋' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4행 5열 프리셋' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '3행 2열 프리셋' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '4행 2열 프리셋' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '사용자 지정' })).toBeInTheDocument()
  })
})
