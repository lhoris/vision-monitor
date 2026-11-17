export const DAY_SECONDS = 24 * 60 * 60
export const MIN_WORK_AREA_SECONDS = 5
export const TIMELINE_ZOOM_LEVELS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512] as const
export type TimelineZoomLevel = (typeof TIMELINE_ZOOM_LEVELS)[number]

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

export function resizeWorkAreaToDuration(range: TimelineRangeSeconds, duration: number): TimelineRangeSeconds {
  const width = Math.min(Math.max(duration, MIN_WORK_AREA_SECONDS), DAY_SECONDS)
  const center = (range.from + range.to) / 2
  const from = Math.min(Math.max(center - width / 2, 0), DAY_SECONDS - width)
  return { from, to: from + width }
}

export function resizeWorkAreaFromStart(range: TimelineRangeSeconds, duration: number): TimelineRangeSeconds {
  const from = clampDaySeconds(range.from)
  const width = Math.min(Math.max(duration, MIN_WORK_AREA_SECONDS), DAY_SECONDS)
  return { from, to: Math.min(DAY_SECONDS, from + width) }
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

export function getTimelineViewRange(zoom: TimelineZoomLevel, center: number): TimelineRangeSeconds {
  const width = DAY_SECONDS / zoom
  const safeCenter = clampDaySeconds(center)
  const from = Math.min(Math.max(safeCenter - width / 2, 0), DAY_SECONDS - width)
  return { from, to: from + width }
}

export function zoomTimelineRange(
  current: TimelineRangeSeconds,
  zoom: TimelineZoomLevel,
  anchor = (current.from + current.to) / 2
): TimelineRangeSeconds {
  const next = getTimelineViewRange(zoom, anchor)
  return next
}

export function secondsToRangePercent(value: number, range: TimelineRangeSeconds): number {
  const width = Math.max(range.to - range.from, 1)
  return Math.min(Math.max(((value - range.from) / width) * 100, 0), 100)
}

export function percentToRangeSeconds(percent: number, range: TimelineRangeSeconds): number {
  const safePercent = Math.min(Math.max(percent, 0), 100)
  return clampDaySeconds(range.from + ((range.to - range.from) * safePercent) / 100)
}

export function getTimelineTickStep(range: TimelineRangeSeconds): number {
  const width = range.to - range.from
  if (width >= 12 * 60 * 60) return 2 * 60 * 60
  if (width >= 6 * 60 * 60) return 60 * 60
  if (width >= 3 * 60 * 60) return 30 * 60
  if (width >= 60 * 60) return 15 * 60
  if (width >= 30 * 60) return 5 * 60
  if (width >= 10 * 60) return 60
  return 10
}

export function formatTimelineScaleTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainder = safeSeconds % 60
  if (hours === 0 && remainder > 0) {
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function formatTimelineDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainder = safeSeconds % 60
  if (hours > 0) return `${hours}시간 ${minutes}분`
  if (minutes > 0 && remainder > 0) return `${minutes}분 ${remainder}초`
  if (minutes > 0) return `${minutes}분`
  return `${remainder}초`
}

export function formatTimelineClockTime(seconds: number): string {
  const safeSeconds = Math.min(Math.max(Math.round(seconds), 0), DAY_SECONDS - 1)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainder = safeSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function parseTimelineClockTime(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  if (hours > 23 || minutes > 59 || seconds > 59) return null
  return hours * 3600 + minutes * 60 + seconds
}

