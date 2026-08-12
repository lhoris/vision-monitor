/**
 * Events Page
 * 이벤트 필터링, 테이블, 상세 패널
 */

import { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
} from '@/components/Common'
import { useAppSelector, useAppDispatch } from '@/store'
import { setFilter, acknowledgeEvent } from '@/store/slices/eventSlice'
import type { Event } from '@/types'

// Mock events data
const mockEvents: Event[] = [
  {
    id: 1,
    cameraId: 1,
    type: 'motion_detected',
    severity: 'low',
    description: 'Motion detected in area A',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    acknowledged: false,
  },
  {
    id: 2,
    cameraId: 2,
    type: 'camera_offline',
    severity: 'high',
    description: 'Camera 2 went offline',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    acknowledged: false,
  },
  {
    id: 3,
    cameraId: 3,
    type: 'tampering_detected',
    severity: 'critical',
    description: 'Tampering detected on camera lens',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    acknowledged: false,
  },
  {
    id: 4,
    cameraId: 1,
    type: 'motion_detected',
    severity: 'medium',
    description: 'Sustained motion detected',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    acknowledged: true,
  },
]

export function Events() {
  const dispatch = useAppDispatch()
  const filter = useAppSelector((state) => state.event.filter)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>(mockEvents)

  const cameras = useAppSelector((state) => state.camera.cameras)

  const cameraOptions = cameras.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }))

  const severityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ]

  const typeOptions = [
    { value: 'motion_detected', label: 'Motion Detected' },
    { value: 'camera_offline', label: 'Camera Offline' },
    { value: 'tampering_detected', label: 'Tampering Detected' },
    { value: 'recording_error', label: 'Recording Error' },
  ]

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (filter.severity && event.severity !== filter.severity) return false
    if (filter.cameraId && event.cameraId !== filter.cameraId) return false
    if (filter.type && event.type !== filter.type) return false
    return true
  })

  const handleAcknowledge = (eventId: number) => {
    setEvents(
      events.map((e) =>
        e.id === eventId ? { ...e, acknowledged: true } : e
      )
    )
    dispatch(acknowledgeEvent(eventId))
  }

  const handleBulkAcknowledge = () => {
    const unacknowledgedIds = filteredEvents
      .filter((e) => !e.acknowledged)
      .map((e) => e.id)

    setEvents(
      events.map((e) =>
        unacknowledgedIds.includes(e.id) ? { ...e, acknowledged: true } : e
      )
    )
  }

  const getCameraName = (cameraId: number) => {
    return cameras.find((c) => c.id === cameraId)?.name || `Camera ${cameraId}`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'critical':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const unacknowledgedCount = events.filter((e) => !e.acknowledged).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage system events and alerts
          </p>
        </div>
        {unacknowledgedCount > 0 && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg">
            <span className="font-semibold">{unacknowledgedCount}</span>{' '}
            unacknowledged events
          </div>
        )}
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Severity"
              options={[
                { value: '', label: 'All Severities' },
                ...severityOptions,
              ]}
              value={filter.severity || ''}
              onChange={(e) =>
                dispatch(
                  setFilter({
                    ...filter,
                    severity: e.target.value as any,
                  })
                )
              }
            />
            <Select
              label="Camera"
              options={[{ value: '', label: 'All Cameras' }, ...cameraOptions]}
              value={filter.cameraId?.toString() || ''}
              onChange={(e) =>
                dispatch(
                  setFilter({
                    ...filter,
                    cameraId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                )
              }
            />
            <Select
              label="Type"
              options={[{ value: '', label: 'All Types' }, ...typeOptions]}
              value={filter.type || ''}
              onChange={(e) =>
                dispatch(
                  setFilter({
                    ...filter,
                    type: e.target.value,
                  })
                )
              }
            />
            <div className="flex items-end gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => dispatch(setFilter({}))}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Events ({filteredEvents.length})
              </h3>
              {unacknowledgedCount > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleBulkAcknowledge}
                >
                  Acknowledge All
                </Button>
              )}
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                        Time
                      </th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                        Camera
                      </th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                        Severity
                      </th>
                      <th className="text-center px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center px-4 py-8 text-gray-600 dark:text-gray-400"
                        >
                          No events found
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((event) => (
                        <tr
                          key={event.id}
                          className={`
                            hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                            ${
                              !event.acknowledged
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : ''
                            }
                          `}
                          onClick={() => {
                            setSelectedEvent(event)
                          }}
                        >
                          <td className="px-4 py-3">
                            {event.timestamp.toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">
                            {getCameraName(event.cameraId)}
                          </td>
                          <td className="px-4 py-3 capitalize">
                            {event.type.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`
                                px-2 py-1 rounded text-xs font-medium
                                ${getSeverityColor(event.severity)}
                              `}
                            >
                              {event.severity.charAt(0).toUpperCase() +
                                event.severity.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {!event.acknowledged && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAcknowledge(event.id)
                                }}
                              >
                                ACK
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Event Details Sidebar */}
        <div>
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Event Details
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    ID
                  </p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    #{selectedEvent.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Time
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedEvent.timestamp.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Camera
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {getCameraName(selectedEvent.cameraId)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Type
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">
                    {selectedEvent.type.replace(/_/g, ' ')}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Severity
                  </p>
                  <span
                    className={`
                      inline-block px-2 py-1 rounded text-xs font-medium
                      ${getSeverityColor(selectedEvent.severity)}
                    `}
                  >
                    {selectedEvent.severity.charAt(0).toUpperCase() +
                      selectedEvent.severity.slice(1)}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </p>
                  <span
                    className={`
                      inline-block px-2 py-1 rounded text-xs font-medium
                      ${
                        selectedEvent.acknowledged
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }
                    `}
                  >
                    {selectedEvent.acknowledged ? 'Acknowledged' : 'Pending'}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedEvent.description}
                  </p>
                </div>

                {!selectedEvent.acknowledged && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      className="w-full"
                      onClick={() => handleAcknowledge(selectedEvent.id)}
                    >
                      Acknowledge Event
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Select an event to view details
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Events
