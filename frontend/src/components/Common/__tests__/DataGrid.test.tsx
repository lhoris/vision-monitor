import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataGridActionButton, DataGridTable, DataGridText } from '../DataGrid'

describe('DataGrid primitives', () => {
  it('renders a table and an ellipsized text value with its full title', () => {
    render(<DataGridTable><tbody><tr><td><DataGridText title="full value">visible value</DataGridText></td></tr></tbody></DataGridTable>)

    expect(screen.getByRole('table')).toHaveClass('data-grid-table')
    expect(screen.getByText('visible value')).toHaveAttribute('title', 'full value')
  })

  it('applies the requested action button variant', () => {
    render(<DataGridActionButton variant="danger">삭제</DataGridActionButton>)

    expect(screen.getByRole('button', { name: '삭제' })).toHaveClass('text-rose-700')
  })
})
