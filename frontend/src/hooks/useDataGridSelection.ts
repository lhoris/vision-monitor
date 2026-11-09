import { useCallback, useState } from 'react'

export function useDataGridSelection<T>(visibleIds: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set())
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))

  const toggle = useCallback((id: T) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const select = useCallback((id: T) => {
    setSelectedIds((current) => current.has(id) ? current : new Set(current).add(id))
  }, [])

  const selectMany = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const toggleVisible = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current)
      visibleIds.forEach((id) => allVisibleSelected ? next.delete(id) : next.add(id))
      return next
    })
  }, [allVisibleSelected, visibleIds])

  const clear = useCallback(() => setSelectedIds(new Set()), [])

  return { selectedIds, allVisibleSelected, toggle, select, selectMany, toggleVisible, clear }
}
