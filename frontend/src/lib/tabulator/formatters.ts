import type { CellComponent, ColumnDefinition, Editor } from 'tabulator-tables'

export const TABULATOR_CHECKBOX_CLASS = 'vm-tabulator-checkbox'
export const TABULATOR_SELECTED_CELL_CLASS = 'vm-tabulator-cell-selected'

export interface CheckboxFormatterOptions {
  className?: string
  disabled?: boolean
}

export function checkboxFormatter({
  className = TABULATOR_CHECKBOX_CLASS,
  disabled = true,
}: CheckboxFormatterOptions = {}): NonNullable<ColumnDefinition['formatter']> {
  return (cell) => {
    const checked = Boolean(cell.getValue()) ? ' checked' : ''
    const disabledAttr = disabled ? ' disabled' : ''

    return `<input type="checkbox" class="${className}" tabindex="-1"${checked}${disabledAttr} />`
  }
}

export function toggleBooleanCell(cell: CellComponent): void {
  cell.setValue(!Boolean(cell.getValue()))
}

export const nativeDateEditor: Editor = (cell, onRendered, success, cancel) => {
  const input = document.createElement('input')
  input.type = 'date'
  input.className = 'vm-tabulator-date-editor'
  input.value = String(cell.getValue() ?? '')

  onRendered(() => {
    input.focus()
    input.select()
  })

  input.addEventListener('change', () => success(input.value))
  input.addEventListener('blur', () => success(input.value))
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      success(input.value)
    }

    if (event.key === 'Escape') {
      cancel(undefined)
    }
  })

  return input
}

export function clearSelectedCells(root: HTMLElement): void {
  root
    .querySelectorAll(`.${TABULATOR_SELECTED_CELL_CLASS}`)
    .forEach((cell) => cell.classList.remove(TABULATOR_SELECTED_CELL_CLASS))
}

export function markSelectedCell(cell: CellComponent): void {
  clearSelectedCells(cell.getTable().element)
  cell.getElement().classList.add(TABULATOR_SELECTED_CELL_CLASS)
}
