import { useCallback, useEffect, useRef, type RefObject } from 'react'
import {
  TabulatorFull as Tabulator,
  type ColumnDefinition,
  type Options,
} from 'tabulator-tables'

export interface UseTabulatorOptions<TData extends object> {
  data: TData[]
  columns: ColumnDefinition[]
  tableOptions?: Partial<Options>
  onTableBuilt?: (table: Tabulator) => void
}

export interface UseTabulatorResult {
  mountRef: RefObject<HTMLDivElement | null>
  tableRef: RefObject<Tabulator | null>
  redraw: (force?: boolean) => void
  destroy: () => void
}

export function useTabulator<TData extends object>({
  data,
  columns,
  tableOptions,
  onTableBuilt,
}: UseTabulatorOptions<TData>): UseTabulatorResult {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<Tabulator | null>(null)

  const destroy = useCallback(() => {
    tableRef.current?.destroy()
    tableRef.current = null
  }, [])

  const redraw = useCallback((force = false) => {
    tableRef.current?.redraw(force)
  }, [])

  useEffect(() => {
    if (!mountRef.current) return undefined

    const table = new Tabulator(mountRef.current, {
      layout: 'fitColumns',
      height: '100%',
      selectableRows: false,
      ...tableOptions,
      data,
      columns,
    })

    tableRef.current = table
    table.on('tableBuilt', () => onTableBuilt?.(table))

    return () => {
      table.destroy()
      if (tableRef.current === table) {
        tableRef.current = null
      }
    }
  }, [columns, data, onTableBuilt, tableOptions])

  return { mountRef, tableRef, redraw, destroy }
}
