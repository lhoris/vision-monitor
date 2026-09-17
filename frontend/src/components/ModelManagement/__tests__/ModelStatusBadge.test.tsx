import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ModelStatusBadge } from '@/components/ModelManagement/ModelStatusBadge'

describe('ModelStatusBadge', () => {
  it('renders process and link status labels', () => {
    render(<><ModelStatusBadge status="running" kind="process" /><ModelStatusBadge status="failed" kind="link" /></>)
    expect(screen.getByText('실행 중')).toBeInTheDocument()
    expect(screen.getByText('실패')).toBeInTheDocument()
  })
})
