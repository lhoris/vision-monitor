import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GridColumnFilterRow } from '../GridColumnFilterRow'

describe('GridColumnFilterRow', () => {
  it('renders text and select column filters', () => {
    render(
      <table>
        <thead>
          <GridColumnFilterRow
            filters={[
              { id: 'name', ariaLabel: '이름 필터', value: '', onChange: vi.fn() },
              {
                id: 'status',
                ariaLabel: '상태 필터',
                kind: 'select',
                value: '',
                onChange: vi.fn(),
                options: [
                  { value: '', label: '전체' },
                  { value: '활성', label: '활성' },
                ],
              },
            ]}
          />
        </thead>
      </table>
    )

    expect(screen.getByLabelText('이름 필터')).toBeInTheDocument()
    expect(screen.getByLabelText('상태 필터')).toBeInTheDocument()
  })

  it('emits filter changes', () => {
    const onNameChange = vi.fn()
    const onStatusChange = vi.fn()

    render(
      <table>
        <thead>
          <GridColumnFilterRow
            filters={[
              { id: 'name', ariaLabel: '이름 필터', value: '', onChange: onNameChange },
              {
                id: 'status',
                ariaLabel: '상태 필터',
                kind: 'select',
                value: '',
                onChange: onStatusChange,
                options: [
                  { value: '', label: '전체' },
                  { value: '활성', label: '활성' },
                ],
              },
            ]}
          />
        </thead>
      </table>
    )

    fireEvent.change(screen.getByLabelText('이름 필터'), { target: { value: 'tester' } })
    fireEvent.change(screen.getByLabelText('상태 필터'), { target: { value: '활성' } })

    expect(onNameChange).toHaveBeenCalledWith('tester')
    expect(onStatusChange).toHaveBeenCalledWith('활성')
  })
})
