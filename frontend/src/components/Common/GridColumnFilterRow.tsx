export interface GridColumnFilterOption {
  value: string
  label: string
}

export interface GridColumnFilter {
  id: string
  ariaLabel: string
  value: string
  widthClassName?: string
  kind?: 'text' | 'select' | 'empty'
  options?: GridColumnFilterOption[]
  onChange?: (value: string) => void
}

interface GridColumnFilterRowProps {
  filters: GridColumnFilter[]
}

export function GridColumnFilterRow({ filters }: GridColumnFilterRowProps) {
  return (
    <tr className="bg-[#eef8ff] dark:bg-slate-900">
      {filters.map((filter) => (
        <th key={filter.id} className={`${filter.widthClassName ?? ''} h-9 border-b border-r border-[#9dcced] p-0.5 dark:border-slate-700`}>
          {filter.kind === 'empty' ? null : filter.kind === 'select' ? (
            <select
              aria-label={filter.ariaLabel}
              value={filter.value}
              onChange={(event) => filter.onChange?.(event.target.value)}
              className="box-border h-8 w-full rounded-none border border-[#9dcced] bg-white px-2 text-xs font-normal normal-case text-slate-800 outline-none focus:border-[#58aee4] dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              {(filter.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              aria-label={filter.ariaLabel}
              value={filter.value}
              onChange={(event) => filter.onChange?.(event.target.value)}
              className="box-border h-8 w-full rounded-none border border-[#9dcced] bg-white px-2 text-xs font-normal normal-case text-slate-800 outline-none focus:border-[#58aee4] dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          )}
        </th>
      ))}
    </tr>
  )
}
