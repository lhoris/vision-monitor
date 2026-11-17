import { describe, expect, it } from 'vitest'
import {
  DAY_SECONDS,
  dateToDaySeconds,
  formatTimelineTime,
  moveWorkArea,
  normalizeWorkArea,
  resizeWorkArea,
} from '../recordingTimelineModel'

describe('recordingTimelineModel', () => {
  it('keeps a work area inside the day and preserves its width when moving', () => {
    const range = normalizeWorkArea({ from: 100, to: 130 })
    expect(moveWorkArea(range, -200)).toEqual({ from: 0, to: 30 })
    expect(moveWorkArea(range, DAY_SECONDS)).toEqual({ from: DAY_SECONDS - 30, to: DAY_SECONDS })
  })

  it('prevents handles from crossing and keeps the minimum width', () => {
    expect(resizeWorkArea({ from: 100, to: 130 }, 'start', 129)).toEqual({ from: 125, to: 130 })
    expect(resizeWorkArea({ from: 100, to: 130 }, 'end', 101)).toEqual({ from: 100, to: 105 })
  })

  it('converts local dates into day offsets and readable labels', () => {
    expect(dateToDaySeconds('2026-11-17T07:30:00', '2026-11-17T00:00:00')).toBe(27000)
    expect(formatTimelineTime(27000)).toBe('07:30')
  })
})
