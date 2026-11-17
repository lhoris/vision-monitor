export const DAY_SECONDS = 24 * 60 * 60
export const MIN_WORK_AREA_SECONDS = 5

export interface TimelineRangeSeconds {
  from: number
  to: number
}

export type WorkAreaDragMode = 'start' | 'move' | 'end'

export function clampDaySeconds(value: number): number {
  return Math.min(Math.max(value, 0), DAY_SECONDS)
}

export function normalizeWorkArea(range: TimelineRangeSeconds, minimum = MIN_WORK_AREA_SECONDS): TimelineRangeSeconds {
  const from = clampDaySeconds(range.from)
  const to = clampDaySeconds(range.to)
  if (to - from >= minimum) return { from, to }

  if (from + minimum <= DAY_SECONDS) return { from, to: from + minimum }
  return { from: Math.max(0, DAY_SECONDS - minimum), to: DAY_SECONDS }
}

export function moveWorkArea(range: TimelineRangeSeconds, delta: number): TimelineRangeSeconds {
  const width = range.to - range.from
  const nextFrom = clampDaySeconds(range.from + delta)
  const adjustedFrom = Math.min(nextFrom, DAY_SECONDS - width)
  return { from: adjustedFrom, to: adjustedFrom + width }
}

export function resizeWorkArea(
  range: TimelineRangeSeconds,
  edge: 'start' | 'end',
  value: number,
  minimum = MIN_WORK_AREA_SECONDS
): TimelineRangeSeconds {
  if (edge === 'start') {
    return normalizeWorkArea({ from: Math.min(clampDaySeconds(value), range.to - minimum), to: range.to }, minimum)
  }
  return normalizeWorkArea({ from: range.from, to: Math.max(clampDaySeconds(value), range.from + minimum) }, minimum)
}

export function secondsToPercent(value: number): number {
  return (clampDaySeconds(value) / DAY_SECONDS) * 100
}

export function percentToSeconds(percent: number): number {
  return clampDaySeconds((Math.min(Math.max(percent, 0), 100) / 100) * DAY_SECONDS)
}

export function dateToDaySeconds(value: string, dayStart: string): number {
  return clampDaySeconds((new Date(value).getTime() - new Date(dayStart).getTime()) / 1000)
}

export function daySecondsToDate(seconds: number, dayStart: string): Date {
  return new Date(new Date(dayStart).getTime() + clampDaySeconds(seconds) * 1000)
}

export function formatTimelineDateTime(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
}

export function formatTimelineTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

