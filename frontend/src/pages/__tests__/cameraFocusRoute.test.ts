import { describe, expect, it } from 'vitest'
import { parseCameraFocusRouteState } from '../cameraFocusRoute'

describe('camera focus route state parser', () => {
  it('parses live mode as the default route state', () => {
    expect(parseCameraFocusRouteState('1', new URLSearchParams(''))).toEqual({
      cameraId: 1,
      mode: 'live',
      selectedEventId: undefined,
    })
  })

  it('parses recording mode and selected event id', () => {
    expect(parseCameraFocusRouteState('7', new URLSearchParams('mode=recording&eventId=50001'))).toEqual({
      cameraId: 7,
      mode: 'recording',
      selectedEventId: 50001,
    })
  })

  it('normalizes invalid mode and invalid event id', () => {
    expect(parseCameraFocusRouteState('2', new URLSearchParams('mode=bad&eventId=abc'))).toEqual({
      cameraId: 2,
      mode: 'live',
      selectedEventId: undefined,
    })
  })

  it('marks invalid camera id as null', () => {
    expect(parseCameraFocusRouteState('bad', new URLSearchParams('mode=recording'))).toEqual({
      cameraId: null,
      mode: 'recording',
      selectedEventId: undefined,
    })
  })
})
