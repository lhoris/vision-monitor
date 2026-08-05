/**
 * Layout Selector Component
 * 그리드 레이아웃 선택 드롭다운
 */

import React from 'react'
import type { GridDimensions } from './types'

interface LayoutSelectorProps {
  currentLayout: string
  options: GridDimensions[]
  onLayoutChange: (layout: GridDimensions) => void
  disabled?: boolean
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  options,
  onLayoutChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((opt) => opt.label === e.target.value)
    if (selected) {
      onLayoutChange(selected)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="layout-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Grid Layout:
      </label>
      <select
        id="layout-select"
        value={currentLayout}
        onChange={handleChange}
        disabled={disabled}
        className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   hover:border-gray-400 dark:hover:border-gray-500
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        {options.map((option) => (
          <option key={option.label} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LayoutSelector
