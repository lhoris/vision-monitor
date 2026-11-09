import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDataGridSelection } from '../useDataGridSelection'

describe('useDataGridSelection', () => {
  it('selects and toggles visible rows', () => {
    const { result } = renderHook(() => useDataGridSelection(['a', 'b']))

    expect(result.current.allVisibleSelected).toBe(false)
    act(() => result.current.toggleVisible())
    expect([...result.current.selectedIds]).toEqual(['a', 'b'])
    expect(result.current.allVisibleSelected).toBe(true)

    act(() => result.current.toggle('a'))
    expect([...result.current.selectedIds]).toEqual(['b'])
    expect(result.current.allVisibleSelected).toBe(false)
  })

  it('selects a set of rows and clears it', () => {
    const { result } = renderHook(() => useDataGridSelection([1, 2, 3]))

    act(() => result.current.selectMany([1, 3]))
    expect([...result.current.selectedIds]).toEqual([1, 3])

    act(() => result.current.clear())
    expect(result.current.selectedIds.size).toBe(0)
  })
})
