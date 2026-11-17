import { describe, expect, it } from 'vitest'
import {
  DAY_SECONDS,
  dateToDaySeconds,
  formatTimelineTime,
  formatTimelineClockTime,
  getTimelineTickStep,
  getTimelineViewRange,
  moveWorkArea,
  normalizeWorkArea,
  resizeWorkArea,
  resizeWorkAreaToDuration,
  parseTimelineClockTime,
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

  it('creates a centered zoom window and adapts the scale to the visible range', () => {
    expect(getTimelineViewRange(2, 30600)).toEqual({ from: 9000, to: 52200 })
    expect(getTimelineTickStep({ from: 9000, to: 52200 })).toBe(2 * 60 * 60)
    expect(getTimelineTickStep({ from: 26970, to: 27030 })).toBe(10)
  })

  it('changes work area duration around the current center', () => {
    expect(resizeWorkAreaToDuration({ from: 100, to: 160 }, 30)).toEqual({ from: 115, to: 145 })
    expect(resizeWorkAreaToDuration({ from: 10, to: 20 }, DAY_SECONDS)).toEqual({ from: 0, to: DAY_SECONDS })
  })

  it('formats and parses precise clock values for manual work area editing', () => {
    expect(formatTimelineClockTime(29730)).toBe('08:15:30')
    expect(parseTimelineClockTime('08:15:30')).toBe(29730)
    expect(parseTimelineClockTime('25:00:00')).toBeNull()
  })
})
