import { fireEvent, render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MetadataSectionEditor } from '../MetadataSectionEditor'
import type { MetadataQueryDefinition } from '@/types/metadataConfig'
import i18n from '@/i18n'

const queries: MetadataQueryDefinition[] = [
  {
    queryId: 'camera.status',
    description: '카메라 상태 조회',
    sqlText: 'SELECT status FROM camera_status',
    allowedParameters: [],
    resultSchema: [
      { name: 'label', label: 'Label', type: 'string' },
      { name: 'value', label: 'Value', type: 'string' },
    ],
    enabled: true,
  },
]

function renderEditor(props: ComponentProps<typeof MetadataSectionEditor>) {
  return render(<I18nextProvider i18n={i18n}><MetadataSectionEditor {...props} /></I18nextProvider>)
}

describe('MetadataSectionEditor', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko')
  })

  it('saves a free text section without a query', () => {
    const onSave = vi.fn()
    renderEditor({ queries, onSave, onClose: vi.fn() })

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Static note' } })
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'text' } })
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'Static content' } })
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
    renderEditor({ queries, onSave: vi.fn(), onClose: vi.fn() })

    expect(screen.queryByLabelText('라벨 필드')).not.toBeInTheDocument()
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'text' } })
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'label_value' } })
    expect(screen.getByLabelText('라벨 필드')).toBeInTheDocument()
    expect(screen.getByLabelText('값 필드')).toBeInTheDocument()
  })

  it('shows the query description with the query id', () => {
    renderEditor({ queries, onSave: vi.fn(), onClose: vi.fn() })

    expect(screen.getByRole('option', { name: 'camera.status - 카메라 상태 조회' })).toBeInTheDocument()
    expect(screen.getAllByText('카메라 상태 조회').length).toBeGreaterThan(0)
  })
})
