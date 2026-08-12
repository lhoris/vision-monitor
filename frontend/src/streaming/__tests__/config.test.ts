import { describe, expect, it } from 'vitest'
import { buildCameraStreamPageUrl, isStreamPageUrl } from '../config'

describe('streaming config', () => {
  it('builds camera stream page urls from camera number', () => {
    expect(buildCameraStreamPageUrl(3)).toBe(
      'http://220.81.187.50:1984/stream.html?src=video_high3'
    )
  })

  it('detects go2rtc stream page urls', () => {
    expect(isStreamPageUrl('http://220.81.187.50:1984/stream.html?src=video_high1')).toBe(true)
    expect(isStreamPageUrl('http://220.81.187.50:1984/other.html?src=video_high1')).toBe(false)
    expect(isStreamPageUrl('not-a-url')).toBe(false)
  })
})
