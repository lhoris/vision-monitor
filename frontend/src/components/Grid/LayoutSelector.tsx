/**
 * Layout Selector Component
 * 바둑판 형식의 그리드 레이아웃 선택
 */

import React, { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectLayout = (option: GridDimensions) => {
    onLayoutChange(option)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   hover:bg-gray-50 dark:hover:bg-gray-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors flex items-center gap-2 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 m0 0a2 2 0 m0 0a2 2 0 m0-10a2 2 0 m0 0a2 2 0 m0 0a2 2 0 m0 10v-6m0-6h6m0 0v10" />
        </svg>
        Grid: {currentLayout}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid gap-3">
              {options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleSelectLayout(option)}
                  className={`relative p-3 rounded-lg border-2 transition-all group
                    ${
                      currentLayout === option.label
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                  title={`${option.rows}x${option.cols} layout`}
                >
                  {/* Visual Grid Preview */}
                  <div className="w-20 h-20 grid gap-1" style={{
                    gridTemplateColumns: `repeat(${option.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${option.rows}, 1fr)`,
                  }}>
                    {Array.from({ length: option.rows * option.cols }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-blue-200 dark:bg-blue-700 rounded border border-blue-400 dark:border-blue-500"
                      />
                    ))}
                  </div>
                  {/* Label */}
                  <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LayoutSelector
