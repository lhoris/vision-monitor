import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TabsBar } from '../TabsBar'
import { SubTabsBar } from '../SubTabsBar'
import type { Tab } from '@/types/layout'
import i18n from '@/i18n'

beforeEach(async () => {
  await i18n.changeLanguage('en')
})

const tabs: Tab[] = [{
  id: 'process-a',
  name: '공정 A',
  activeSubTab: 'equipment-a',
  subTabs: [],
  createdAt: '',
  updatedAt: '',
}]

describe('TabsBar rename', () => {
  it('confirms a process tab name using the visible save button', () => {
    const onRenameTab = vi.fn()
    render(
      <TabsBar
        tabs={tabs}
        activeTabId="process-a"
        onTabChange={vi.fn()}
        onAddTab={vi.fn()}
        onRemoveTab={vi.fn()}
        onRenameTab={onRenameTab}
      />
    )

    fireEvent.doubleClick(screen.getByText('공정 A'))
    fireEvent.change(screen.getByDisplayValue('공정 A'), { target: { value: '가열 공정' } })
    fireEvent.click(screen.getByRole('button', { name: '이름 저장' }))

    expect(onRenameTab).toHaveBeenCalledWith('process-a', '가열 공정')
    expect(screen.getByText('공정 A')).toBeInTheDocument()
  })

  it('renames a detail tab using the visible save button', () => {
    const onRenameSubTab = vi.fn()
    render(
      <SubTabsBar
        subTabs={[{
          id: 'equipment-a',
          name: '설비 A',
          gridConfig: { rows: 2, cols: 2, layout: 'grid', gapSize: 8 },
          cameraPositions: [],
          createdAt: '',
          updatedAt: '',
        }]}
        activeSubTabId="equipment-a"
        onSubTabChange={vi.fn()}
        onAddSubTab={vi.fn()}
        onRemoveSubTab={vi.fn()}
        onRenameSubTab={onRenameSubTab}
      />
    )

    fireEvent.doubleClick(screen.getByText('설비 A'))
    fireEvent.change(screen.getByRole('textbox', { name: '세부공정 이름' }), {
      target: { value: '가열 1라인' },
    })
    fireEvent.click(screen.getByRole('button', { name: '세부공정 이름 저장' }))

    expect(onRenameSubTab).toHaveBeenCalledWith('equipment-a', '가열 1라인')
  })
})
