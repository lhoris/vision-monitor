import type { ApiResponse } from '@/types/api'
import type { AcknowledgeEventDto, EventDetailDto } from '@/types/cameraFocus'
import {
  EVENT_DETAIL_MOCK_TIMESTAMP,
  FORBIDDEN_EVENT_DETAIL_ID,
  buildAcknowledgeEventFixture,
  findEventDetailFixture,
} from '@/mocks/eventDetails'

export const EVENT_DETAIL_ENDPOINT_TEMPLATE = '/api/events/{eventId}'
export const EVENT_ACKNOWLEDGE_ENDPOINT_TEMPLATE = '/api/events/{eventId}/acknowledge'

export function buildEventDetailEndpoint(eventId: number): string {
  if (!isValidId(eventId)) {
    throw new RangeError('eventId must be a positive integer.')
  }
  return EVENT_DETAIL_ENDPOINT_TEMPLATE.replace('{eventId}', String(eventId))
}

export function buildEventAcknowledgeEndpoint(eventId: number): string {
  if (!isValidId(eventId)) {
    throw new RangeError('eventId must be a positive integer.')
  }
  return EVENT_ACKNOWLEDGE_ENDPOINT_TEMPLATE.replace('{eventId}', String(eventId))
}

export async function getEventDetailMock(eventId: number): Promise<ApiResponse<EventDetailDto>> {
  if (!isValidId(eventId)) {
    return {
      success: false,
      error: 'INVALID_EVENT_ID',
      message: 'Event id must be a positive integer.',
      timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
    }
  }

  if (eventId === FORBIDDEN_EVENT_DETAIL_ID) {
    return {
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to access this event.',
      timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
    }
  }

  const data = findEventDetailFixture(eventId)
  if (!data) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Event detail not found.',
      timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
    }
  }

  return {
    success: true,
    data,
    timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
  }
}

export async function acknowledgeEventMock(
  eventId: number
): Promise<ApiResponse<AcknowledgeEventDto>> {
  if (!isValidId(eventId)) {
    return {
      success: false,
      error: 'INVALID_EVENT_ID',
      message: 'Event id must be a positive integer.',
      timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
    }
  }

  if (eventId === FORBIDDEN_EVENT_DETAIL_ID) {
    return {
      success: false,
      error: 'FORBIDDEN',
      message: 'You do not have permission to acknowledge this event.',
      timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
    }
  }

  if (!findEventDetailFixture(eventId)) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Event detail not found.',
      timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
    }
  }

  return {
    success: true,
    data: buildAcknowledgeEventFixture(eventId),
    timestamp: EVENT_DETAIL_MOCK_TIMESTAMP,
  }
}

function isValidId(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0
}
