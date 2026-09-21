import React, { useState } from 'react'
import type { GridDimensions } from './types'

interface LayoutSelectorProps {
  currentLayout: string
  options: GridDimensions[]
  onLayoutChange: (layout: GridDimensions) => void
  disabled?: boolean
}

const MAX_ROWS = 5
const MAX_COLS = 6

function parseDimensions(layout: string) {
  const [rows, cols] = layout.split('x').map(Number)
  return {
    rows: Number.isInteger(rows) && rows > 0 ? rows : 1,
    cols: Number.isInteger(cols) && cols > 0 ? cols : 1,
  }
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  options,
  onLayoutChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'presets' | 'custom'>('presets')
  const [preview, setPreview] = useState<{ rows: number; cols: number } | null>(null)
  const current = parseDimensions(currentLayout)
  const displayed = preview ?? current

  const handleSelectLayout = (rows: number, cols: number) => {
    onLayoutChange({ rows, cols, label: `${rows}x${cols}` })
    setIsOpen(false)
    setPreview(null)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 12h16M12 4v16" />
        </svg>
        Grid: {currentLayout}
        <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => {
              setIsOpen(false)
              setPreview(null)
            }}
          />
          <div
            role="dialog"
            aria-label="그리드 레이아웃 선택"
            className="absolute right-0 top-full z-50 mt-2 w-[270px] rounded-md border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setIsOpen(false)
                setPreview(null)
              }
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">레이아웃 선택</span>
              <span aria-live="polite" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {displayed.rows} × {displayed.cols}
              </span>
            </div>
            <div className="mb-3 grid grid-cols-2 rounded-md bg-gray-100 p-1 dark:bg-gray-900" role="group" aria-label="레이아웃 선택 방식">
              <button
                type="button"
                aria-pressed={mode === 'presets'}
                onClick={() => setMode('presets')}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'presets' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
              >
                목록
              </button>
              <button
                type="button"
                aria-pressed={mode === 'custom'}
                onClick={() => setMode('custom')}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'custom' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
              >
                사용자 지정
              </button>
            </div>

            {mode === 'presets' ? (
              <div className="grid grid-cols-2 gap-2">
                {options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    aria-label={`${option.rows}행 ${option.cols}열 프리셋`}
                    aria-pressed={current.rows === option.rows && current.cols === option.cols}
                    onClick={() => handleSelectLayout(option.rows, option.cols)}
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      current.rows === option.rows && current.cols === option.cols
                        ? 'border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="grid h-7 w-8 shrink-0 gap-px" style={{ gridTemplateColumns: `repeat(${option.cols}, 1fr)`, gridTemplateRows: `repeat(${option.rows}, 1fr)` }} aria-hidden="true">
                      {Array.from({ length: option.rows * option.cols }, (_, index) => (
                        <span key={index} className="rounded-[1px] bg-current opacity-40" />
                      ))}
                    </span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="mx-auto grid w-fit gap-1"
                aria-label={`${MAX_ROWS}행 ${MAX_COLS}열 선택판`}
                style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 32px)` }}
                onMouseLeave={() => setPreview(null)}
              >
                {Array.from({ length: MAX_ROWS * MAX_COLS }, (_, index) => {
                  const row = Math.floor(index / MAX_COLS) + 1
                  const col = (index % MAX_COLS) + 1
                  const highlighted = row <= displayed.rows && col <= displayed.cols
                  const selected = row <= current.rows && col <= current.cols

                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      aria-label={`${row}행 ${col}열 레이아웃`}
                      aria-pressed={selected}
                      title={`${row} × ${col}`}
                      onMouseEnter={() => setPreview({ rows: row, cols: col })}
                      onFocus={() => setPreview({ rows: row, cols: col })}
                      onClick={() => handleSelectLayout(row, col)}
                      className={`h-7 w-8 rounded-sm border transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        highlighted
                          ? 'border-blue-600 bg-blue-500 dark:border-blue-300 dark:bg-blue-400'
                          : 'border-gray-300 bg-gray-100 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700'
                      } ${selected ? 'ring-1 ring-blue-700 dark:ring-blue-200' : ''}`}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default LayoutSelector
