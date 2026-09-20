import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MetadataSectionEditor } from '../MetadataSectionEditor'
import type { MetadataQueryDefinition } from '@/types/metadataConfig'

const queries: MetadataQueryDefinition[] = [
  {
    queryId: 'camera.status',
    sqlText: 'SELECT status FROM camera_status',
    allowedParameters: [],
    resultSchema: [
      { name: 'label', label: 'Label', type: 'string' },
      { name: 'value', label: 'Value', type: 'string' },
    ],
    enabled: true,
  },
]

describe('MetadataSectionEditor', () => {
  it('saves a free text section without a query', () => {
    const onSave = vi.fn()
    render(<MetadataSectionEditor queries={queries} onSave={onSave} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'Static note' } })
    fireEvent.change(screen.getByLabelText('표시 형식'), { target: { value: 'text' } })
    fireEvent.change(screen.getByLabelText('기본 텍스트'), { target: { value: 'Static content' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      type: 'text',
      textDisplayMode: 'free',
      queryId: undefined,
      defaultText: 'Static content',
      mapping: {},
    }))
  })

  it('shows field mapping only for label-value text sections', () => {
    render(<MetadataSectionEditor queries={queries} onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.queryByLabelText('라벨 필드')).not.toBeInTheDocument()
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'text' } })
    fireEvent.change(screen.getAllByRole('combobox')[3], { target: { value: 'label_value' } })
    expect(screen.getByLabelText('라벨 필드')).toBeInTheDocument()
    expect(screen.getByLabelText('값 필드')).toBeInTheDocument()
  })
})
