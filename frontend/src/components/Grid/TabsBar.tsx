/**
 * Tabs Bar Component
 * 공정별 탭 관리 UI
 */

import React, { useState } from 'react'
import type { Tab } from '@/types/layout'

interface TabsBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  onAddTab: (tab: Tab) => void
  onRemoveTab: (tabId: string) => void
  onRenameTab?: (tabId: string, newName: string) => void
}

export const TabsBar: React.FC<TabsBarProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  onRemoveTab,
  onRenameTab,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showAddTabInput, setShowAddTabInput] = useState(false)
  const [newTabName, setNewTabName] = useState('')

  const handleRenameSubmit = (tabId: string) => {
    if (editingName.trim() && onRenameTab) {
      onRenameTab(tabId, editingName.trim())
      setEditingTabId(null)
      setEditingName('')
    }
  }

  const handleAddTabSubmit = () => {
    if (newTabName.trim()) {
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        name: newTabName.trim(),
        cameras: [],
        gridConfig: {
          rows: 3,
          cols: 2,
          layout: 'grid',
          gapSize: 8,
        },
        cameraPositions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      onAddTab(newTab)
      setNewTabName('')
      setShowAddTabInput(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* Tabs */}
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative group px-4 py-2 rounded-t-lg cursor-pointer whitespace-nowrap
                transition-all duration-200 flex items-center gap-2
                ${
                  activeTabId === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {editingTabId === tab.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRenameSubmit(tab.id)}
                  onKeyDown={(e) => {
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
                        onRemoveTab(tab.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600
                                 dark:text-red-400 dark:hover:text-red-300 transition-opacity"
                      title="Remove tab"
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
              onClick={() => setShowAddTabInput(true)}
              className="px-4 py-2 rounded-t-lg text-gray-600 dark:text-gray-400
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Add new tab"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TabsBar
