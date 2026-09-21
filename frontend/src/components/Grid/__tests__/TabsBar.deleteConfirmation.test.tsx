import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import type { SubTab, Tab } from '@/types/layout'
import { SubTabsBar } from '../SubTabsBar'
import { TabsBar } from '../TabsBar'

beforeEach(async () => {
  await i18n.changeLanguage('en')
})

const processTabs: Tab[] = [
  { id: 'process-a', name: 'Process A', activeSubTab: 'equipment-a', subTabs: [], createdAt: '', updatedAt: '' },
  { id: 'process-b', name: 'Process B', activeSubTab: 'equipment-b', subTabs: [], createdAt: '', updatedAt: '' },
]

const equipmentTabs: SubTab[] = ['equipment-a', 'equipment-b'].map((id, index) => ({
  id,
  name: `Equipment ${index ? 'B' : 'A'}`,
  gridConfig: { rows: 2, cols: 2, layout: 'grid', gapSize: 8 },
  cameraPositions: [],
  createdAt: '',
  updatedAt: '',
}))

describe('tab deletion confirmation', () => {
  it('removes a process tab only after confirmation', () => {
    const onRemoveTab = vi.fn()
    render(
      <TabsBar
        tabs={processTabs}
        activeTabId="process-a"
        onTabChange={vi.fn()}
        onAddTab={vi.fn()}
        onRemoveTab={onRemoveTab}
      />
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove process tab' })[0])
    expect(screen.getByRole('dialog', { name: 'Remove process tab?' })).toHaveTextContent('Process A')
    expect(onRemoveTab).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onRemoveTab).not.toHaveBeenCalled()

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove process tab' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onRemoveTab).toHaveBeenCalledWith('process-a')
  })

  it('removes an equipment tab only after confirmation', () => {
    const onRemoveSubTab = vi.fn()
    render(
      <SubTabsBar
        subTabs={equipmentTabs}
        activeSubTabId="equipment-a"
        onSubTabChange={vi.fn()}
        onAddSubTab={vi.fn()}
        onRemoveSubTab={onRemoveSubTab}
        onRenameSubTab={vi.fn()}
      />
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove equipment tab' })[0])
    expect(screen.getByRole('dialog', { name: 'Remove equipment tab?' })).toHaveTextContent('Equipment A')
    expect(onRemoveSubTab).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onRemoveSubTab).toHaveBeenCalledWith('equipment-a')
  })

  it('localizes the process removal confirmation in Korean', async () => {
    await i18n.changeLanguage('ko')
    render(
      <TabsBar
        tabs={processTabs}
        activeTabId="process-a"
        onTabChange={vi.fn()}
        onAddTab={vi.fn()}
        onRemoveTab={vi.fn()}
      />
    )

    fireEvent.click(screen.getAllByRole('button', { name: '공정 탭 삭제' })[0])
    expect(screen.getByRole('dialog', { name: '공정 탭 삭제 확인' })).toHaveTextContent('Process A')
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })
})
