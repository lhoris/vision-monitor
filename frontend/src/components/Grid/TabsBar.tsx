/**
 * Tabs Bar Component
 * 공정별 탭 관리 UI
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Tab, SubTab } from '@/types/layout'
import { ConfirmDialog } from '@/components/Common'

interface TabsBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  onAddTab: (tab: Tab) => void
  onRemoveTab: (tabId: string) => void
  onRenameTab?: (tabId: string, newName: string) => void
  onReorderTabs?: (fromIndex: number, toIndex: number) => void
}

export const TabsBar: React.FC<TabsBarProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  onRemoveTab,
  onRenameTab,
  onReorderTabs,
}) => {
  const { t } = useTranslation()
  const [pendingRemoval, setPendingRemoval] = useState<Tab | null>(null)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showAddTabInput, setShowAddTabInput] = useState(false)
  const [newTabName, setNewTabName] = useState('')
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleRenameSubmit = (tabId: string) => {
    const name = editingName.trim()
    if (name && onRenameTab) onRenameTab(tabId, name)
    setEditingTabId(null)
    setEditingName('')
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
    if (draggedFromIndex !== null && draggedFromIndex !== toIndex && onReorderTabs) {
      onReorderTabs(draggedFromIndex, toIndex)
    }
    setDraggedFromIndex(null)
  }

  const handleAddTabSubmit = () => {
    if (newTabName.trim()) {
      const now = new Date().toISOString()
      const defaultSubTab: SubTab = {
        id: `subtab-${Date.now()}`,
        name: 'Equipment 1',
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
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        name: newTabName.trim(),
        subTabs: [defaultSubTab],
        activeSubTab: defaultSubTab.id,
        createdAt: now,
        updatedAt: now,
      }
      onAddTab(newTab)
      setNewTabName('')
      setShowAddTabInput(false)
    }
  }

  return (
    <div className="border-b border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-950">
      <div className="px-4 pt-2 sm:px-6">
        <div className="flex min-h-11 items-end gap-1 overflow-x-auto">
          {/* Tabs */}
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(index, e)}
              onClick={() => onTabChange(tab.id)}
              className={`relative group flex shrink-0 cursor-pointer items-center gap-2 rounded-t-md border px-5 py-2 text-base font-medium whitespace-nowrap
                transition-colors duration-150
                ${
                  activeTabId === tab.id
                    ? 'before:absolute before:inset-x-3 before:bottom-0 before:h-0.5 before:bg-cyan-400 border-slate-700 bg-slate-800 text-white shadow-sm dark:border-slate-600 dark:bg-slate-800'
                    : 'border-transparent bg-transparent text-gray-600 hover:border-gray-300 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white'
                }
                ${dragOverIndex === index && draggedFromIndex !== index ? 'ring-2 ring-blue-400' : ''}
                ${draggedFromIndex === index ? 'opacity-40' : ''}
              `}
            >
              {editingTabId === tab.id ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter') {
                        handleRenameSubmit(tab.id)
                      } else if (e.key === 'Escape') {
                        setEditingTabId(null)
                        setEditingName('')
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 rounded border border-blue-400 bg-white dark:bg-gray-700
                               text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    aria-label="이름 저장"
                    title="이름 저장"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleRenameSubmit(tab.id)
                    }}
                    className={`shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      activeTabId === tab.id
                        ? 'text-white hover:text-cyan-200'
                        : 'text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <span
                    onDoubleClick={() => {
                      setEditingTabId(tab.id)
                      setEditingName(tab.name)
                    }}
                  >
                    {tab.name}
                  </span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingRemoval(tab)
                      }}
                      aria-label={t('live.removeProcessTabAction')}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600
                                 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
                      title={t('live.removeProcessTabAction')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Add Tab Button */}
          {showAddTabInput ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
              <input
                autoFocus
                type="text"
                placeholder="Tab name..."
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTabSubmit()
                  } else if (e.key === 'Escape') {
                    setShowAddTabInput(false)
                    setNewTabName('')
                  }
                }}
                className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={handleAddTabSubmit}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowAddTabInput(false)
                  setNewTabName('')
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddTabInput(true)}
              className="shrink-0 self-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              title="Add new tab"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingRemoval)}
        title={t('live.removeProcessTabTitle')}
        message={t('live.removeProcessTabMessage', { name: pendingRemoval?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={() => {
          if (pendingRemoval) onRemoveTab(pendingRemoval.id)
          setPendingRemoval(null)
        }}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  )
}

export default TabsBar
