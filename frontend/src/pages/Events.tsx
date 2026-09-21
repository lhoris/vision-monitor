import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/store'
import { acknowledgeEvent, setFilter } from '@/store/slices/eventSlice'
import type { Event } from '@/types'
import { getEventDescription, getEventTypeLabel } from '@/utils/eventPresentation'

type StatusFilter = 'all' | 'open' | 'acknowledged'

const eventTypes = [
  'motion_detected',
  'camera_offline',
  'tampering_detected',
  'recording_error',
  'entry_zone_jam',
  'material_size_detected',
  'cooling_bed_temperature_high',
  'rolling_speed_adjusted',
  'material_size_deviation',
  'control_connection_failed',
  'control_command_failed',
]

export function Events() {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const filter = useAppSelector((state) => state.event.filter)
  const events = useAppSelector((state) => state.event.events)
  const loading = useAppSelector((state) => state.event.loading)
  const cameras = useAppSelector((state) => state.camera.cameras)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open')
  const [search, setSearch] = useState('')

  const cameraName = (cameraId: number) => (
    cameras.find((camera) => camera.id === cameraId)?.name
      ?? t('events.cameraFallback', { id: cameraId })
  )

  const eventTypeLabel = (type: string) => getEventTypeLabel(type, t)
  const eventDescription = (event: Event) => getEventDescription(event, i18n.resolvedLanguage ?? i18n.language, t)

  const dateTime = (date: Date, style: 'date' | 'dateTime' = 'dateTime') => {
    const locale = i18n.resolvedLanguage === 'ko' ? 'ko-KR' : 'en-US'
    return new Intl.DateTimeFormat(locale, style === 'date'
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
    ).format(date)
  }

  const openEvents = events.filter((event) => !event.acknowledged)
  const criticalEvents = openEvents.filter((event) => event.severity === 'critical')

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return [...events]
      .filter((event) => {
        if (statusFilter === 'open' && event.acknowledged) return false
        if (statusFilter === 'acknowledged' && !event.acknowledged) return false
        if (filter.severity && event.severity !== filter.severity) return false
        if (filter.cameraId && event.cameraId !== filter.cameraId) return false
        if (filter.type && event.type !== filter.type) return false
        if (query && ![
          eventTypeLabel(event.type),
          eventDescription(event),
          cameraName(event.cameraId),
          String(event.id),
        ].some((value) => value.toLocaleLowerCase().includes(query))) return false
        return true
      })
      .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
  }, [events, filter, statusFilter, search, i18n.resolvedLanguage, cameras])

  const acknowledge = (eventId: number) => {
    dispatch(acknowledgeEvent(eventId))
  }

  const acknowledgeVisible = () => {
    const ids = filteredEvents.filter((event) => !event.acknowledged).map((event) => event.id)
    if (!ids.length) return
    ids.forEach((id) => dispatch(acknowledgeEvent(id)))
  }

  const severityClass = (severity: Event['severity']) => {
    switch (severity) {
      case 'low': return 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200'
      case 'medium': return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
      case 'high': return 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200'
      case 'critical': return 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
    }
  }

  const clearFilters = () => {
    dispatch(setFilter({}))
    setSearch('')
    setStatusFilter('all')
  }

  const selected = selectedEventId === null
    ? null
    : events.find((event) => event.id === selectedEventId) ?? null

  return (
    <main className="mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('events.title')}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('events.subtitle')}</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('events.asOf', { date: dateTime(new Date(), 'date') })}
        </p>
      </header>

      <section aria-label={t('events.summary')} className="grid grid-cols-3 divide-x divide-gray-200 border-y border-gray-200 py-3 dark:divide-gray-700 dark:border-gray-700">
        <div className="px-3 first:pl-0 sm:px-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('events.open')}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">{openEvents.length}</p>
        </div>
        <div className="px-3 sm:px-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('events.critical')}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-700 dark:text-rose-300">{criticalEvents.length}</p>
        </div>
        <div className="px-3 sm:px-5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('events.total')}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white">{events.length}</p>
        </div>
      </section>

      <section aria-label={t('events.filters')} className="flex flex-wrap items-end gap-3">
        <label className="min-w-44 flex-1 text-xs font-medium text-gray-600 dark:text-gray-300">
          {t('events.search')}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('events.searchPlaceholder')}
            className="mt-1.5 h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>
        <label className="min-w-36 text-xs font-medium text-gray-600 dark:text-gray-300">
          {t('events.severity')}
          <select
            value={filter.severity ?? ''}
            onChange={(event) => dispatch(setFilter({ ...filter, severity: (event.target.value || undefined) as typeof filter.severity }))}
            className="mt-1.5 h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">{t('events.allSeverities')}</option>
            {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
              <option key={severity} value={severity}>{t(`events.severities.${severity}`)}</option>
            ))}
          </select>
        </label>
        <label className="min-w-40 text-xs font-medium text-gray-600 dark:text-gray-300">
          {t('events.camera')}
          <select
            value={filter.cameraId?.toString() ?? ''}
            onChange={(event) => dispatch(setFilter({ ...filter, cameraId: event.target.value ? Number(event.target.value) : undefined }))}
            className="mt-1.5 h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">{t('events.allCameras')}</option>
            {cameras.map((camera) => <option key={camera.id} value={camera.id}>{camera.name}</option>)}
          </select>
        </label>
        <label className="min-w-40 text-xs font-medium text-gray-600 dark:text-gray-300">
          {t('events.alarmType')}
          <select
            value={filter.type ?? ''}
            onChange={(event) => dispatch(setFilter({ ...filter, type: event.target.value || undefined }))}
            className="mt-1.5 h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">{t('events.allTypes')}</option>
            {eventTypes.map((type) => <option key={type} value={type}>{t(`events.types.${type}`)}</option>)}
          </select>
        </label>
        <button type="button" onClick={clearFilters} className="h-10 px-2 text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100">
          {t('events.clearFilters')}
        </button>
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('events.alarmList')}</h2>
            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{t('events.resultCount', { count: filteredEvents.length })}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded border border-gray-200 p-0.5 dark:border-gray-700" role="group" aria-label={t('events.statusFilter')}>
              {(['open', 'all', 'acknowledged'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${statusFilter === status ? 'bg-slate-800 text-white dark:bg-slate-700' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                >
                  {t(`events.statusFilters.${status}`)}
                </button>
              ))}
            </div>
            {filteredEvents.some((event) => !event.acknowledged) && (
              <button type="button" onClick={acknowledgeVisible} className="h-8 rounded border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                {t('events.acknowledgeVisible')}
              </button>
            )}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-h-0 overflow-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">{t('events.time')}</th>
                  <th className="px-3 py-3">{t('events.severity')}</th>
                  <th className="px-3 py-3">{t('events.alarm')}</th>
                  <th className="px-3 py-3">{t('events.camera')}</th>
                  <th className="px-3 py-3">{t('events.status')}</th>
                  <th className="px-3 py-3 text-right">{t('events.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">{t('events.loading')}</td></tr>
                ) : filteredEvents.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">{t('events.noResults')}</td></tr>
                ) : filteredEvents.map((event) => (
                  <tr key={event.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/70 ${selected?.id === event.id ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''}`}>
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-gray-600 dark:text-gray-400">{dateTime(event.timestamp)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${severityClass(event.severity)}`}>{t(`events.severities.${event.severity}`)}</span>
                    </td>
                    <td className="max-w-[260px] px-3 py-3">
                      <button type="button" onClick={() => setSelectedEventId(event.id)} aria-pressed={selected?.id === event.id} className="block w-full truncate text-left font-semibold text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300">
                        {eventTypeLabel(event.type)}
                      </button>
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{eventDescription(event)}</p>
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-3 text-gray-700 dark:text-gray-300">{cameraName(event.cameraId)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${event.acknowledged ? 'text-gray-500 dark:text-gray-400' : 'font-semibold text-amber-700 dark:text-amber-300'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${event.acknowledged ? 'bg-gray-400' : 'bg-amber-500'}`} />
                        {event.acknowledged ? t('events.statuses.acknowledged') : t('events.statuses.open')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {!event.acknowledged && (
                        <button type="button" onClick={() => acknowledge(event.id)} className="rounded px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/50">
                          {t('events.acknowledge')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="min-h-[220px] border-t border-gray-200 xl:border-l xl:border-t-0 dark:border-gray-700">
            {selected ? (
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('events.detailTitle')}</h2>
                    <p className="mt-1 font-mono text-xs text-gray-500">#{selected.id}</p>
                  </div>
                  <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${severityClass(selected.severity)}`}>{t(`events.severities.${selected.severity}`)}</span>
                </div>
                <div className="flex-1 space-y-4 p-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('events.alarm')}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{eventTypeLabel(selected.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('events.camera')}</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{cameraName(selected.cameraId)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('events.occurredAt')}</p>
                    <p className="mt-1 text-sm tabular-nums text-gray-900 dark:text-white">{dateTime(selected.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('events.description')}</p>
                    <p className="mt-1 text-sm leading-6 text-gray-800 dark:text-gray-200">{eventDescription(selected)}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('events.acknowledgementMeaning')}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{t('events.acknowledgementHint')}</p>
                  </div>
                </div>
                {!selected.acknowledged && (
                  <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                    <button type="button" onClick={() => acknowledge(selected.id)} className="w-full rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-500">
                      {t('events.acknowledgeAlarm')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center px-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('events.selectPrompt')}</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

export default Events
