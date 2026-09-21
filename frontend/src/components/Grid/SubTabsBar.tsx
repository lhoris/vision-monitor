/**
 * Sub Tabs Bar Component
 * 설비/세부공정 탭 관리 (하위 탭)
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SubTab } from '@/types/layout'
import { ConfirmDialog } from '@/components/Common'

interface SubTabsBarProps {
  subTabs: SubTab[]
  activeSubTabId: string
  onSubTabChange: (subTabId: string) => void
  onAddSubTab: (subTab: SubTab) => void
  onRemoveSubTab: (subTabId: string) => void
  onRenameSubTab: (subTabId: string, newName: string) => void
  onReorderSubTabs?: (fromIndex: number, toIndex: number) => void
  layoutSelector?: React.ReactNode
}

export const SubTabsBar: React.FC<SubTabsBarProps> = ({
  subTabs,
  activeSubTabId,
  onSubTabChange,
  onAddSubTab,
  onRemoveSubTab,
  onRenameSubTab,
  onReorderSubTabs,
  layoutSelector,
}) => {
  const { t } = useTranslation()
  const [pendingRemoval, setPendingRemoval] = useState<SubTab | null>(null)
  const [showAddSubTabInput, setShowAddSubTabInput] = useState(false)
  const [newSubTabName, setNewSubTabName] = useState('')
  const [editingSubTabId, setEditingSubTabId] = useState<string | null>(null)
  const [editingSubTabName, setEditingSubTabName] = useState('')
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAddSubTabSubmit = () => {
    if (newSubTabName.trim()) {
      const now = new Date().toISOString()
      const newSubTab: SubTab = {
        id: `subtab-${Date.now()}`,
        name: newSubTabName.trim(),
        gridConfig: {
          rows: 3,
          cols: 2,
          layout: 'grid',
          gapSize: 8,
        },
        cameraPositions: [],
        createdAt: now,
        updatedAt: now,
      }
      onAddSubTab(newSubTab)
      setNewSubTabName('')
      setShowAddSubTabInput(false)
    }
  }

  const handleRenameSubTabSubmit = (subTabId: string) => {
    const name = editingSubTabName.trim()
    if (name) onRenameSubTab(subTabId, name)
    setEditingSubTabId(null)
    setEditingSubTabName('')
  }

  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedFromIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (toIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    setDragOverIndex(null)
    if (draggedFromIndex !== null && draggedFromIndex !== toIndex && onReorderSubTabs) {
      onReorderSubTabs(draggedFromIndex, toIndex)
    }
    setDraggedFromIndex(null)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 subtab-container">
      <div className="px-6 pt-3">
        <div className="flex items-center gap-2 justify-between">
          {/* Sub Tabs Container */}
          <div className="flex items-center gap-2 overflow-x-auto flex-1 -mb-[2px]">
            {/* Sub Tabs */}
            {subTabs.map((subTab, index) => (
            <div
              key={subTab.id}
              draggable
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(index, e)}
              onClick={() => onSubTabChange(subTab.id)}
              className={`relative px-6 py-2.5 rounded-t-lg cursor-pointer whitespace-nowrap text-base select-none
                transition-all duration-200 flex items-center gap-2 border-b-4 border-transparent
                ${
                  activeSubTabId === subTab.id
                    ? 'subtab-active font-bold'
                    : 'subtab-inactive font-medium bg-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                }
                ${dragOverIndex === index && draggedFromIndex !== index ? 'ring-2 ring-blue-400' : ''}
                ${draggedFromIndex === index ? 'opacity-50' : ''}
              `}
            >
              {editingSubTabId === subTab.id ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    aria-label="세부공정 이름"
                    value={editingSubTabName}
                    onChange={(event) => setEditingSubTabName(event.target.value)}
                    onKeyDown={(event) => {
                      event.stopPropagation()
                      if (event.key === 'Enter') handleRenameSubTabSubmit(subTab.id)
                      if (event.key === 'Escape') {
                        setEditingSubTabId(null)
                        setEditingSubTabName('')
                      }
                    }}
                    onClick={(event) => event.stopPropagation()}
                    className="w-32 rounded border border-blue-400 bg-white px-2 py-1 text-sm text-gray-900 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    aria-label="세부공정 이름 저장"
                    title="이름 저장"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleRenameSubTabSubmit(subTab.id)
                    }}
                    className="text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <span
                  onDoubleClick={(event) => {
                    event.stopPropagation()
                    setEditingSubTabId(subTab.id)
                    setEditingSubTabName(subTab.name)
                  }}
                >
                  {subTab.name}
                </span>
              )}
              {editingSubTabId !== subTab.id && subTabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPendingRemoval(subTab)
                  }}
                  aria-label={t('live.removeSubTabAction')}
                  className="text-red-500 hover:text-red-600 dark:text-red-400"
                  title={t('live.removeSubTabAction')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            ))}

            {/* Add Sub Tab Button */}
          {showAddSubTabInput ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
              <input
                autoFocus
                type="text"
                placeholder="Equipment name..."
                value={newSubTabName}
                onChange={(e) => setNewSubTabName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubTabSubmit()
                  } else if (e.key === 'Escape') {
                    setShowAddSubTabInput(false)
                    setNewSubTabName('')
                  }
                }}
                className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddSubTabSubmit}
                className="text-green-600 dark:text-green-400 hover:text-green-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowAddSubTabInput(false)
                  setNewSubTabName('')
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSubTabInput(true)}
              className="subtab-add-btn px-3 py-2 rounded-md text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600
                         transition-colors text-sm"
              title="Add new equipment"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          </div>

          {/* Layout Selector */}
          {layoutSelector && (
            <div className="flex-shrink-0 ml-4 -mt-[13px]">
              {layoutSelector}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingRemoval)}
        title={t('live.removeSubTabTitle')}
        message={t('live.removeSubTabMessage', { name: pendingRemoval?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={() => {
          if (pendingRemoval) onRemoveSubTab(pendingRemoval.id)
          setPendingRemoval(null)
        }}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  )
}

export default SubTabsBar
