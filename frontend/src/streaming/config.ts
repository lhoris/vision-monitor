const DEFAULT_STREAM_PAGE_BASE_URL = 'http://220.81.187.50:1984'
const DEFAULT_CAMERA_STREAM_PREFIX = 'video_high'

export function getStreamPageBaseUrl(): string {
  return import.meta.env.VITE_STREAM_PAGE_BASE_URL || DEFAULT_STREAM_PAGE_BASE_URL
}

export function buildCameraStreamPageUrl(cameraNumber: number): string {
  const url = new URL('/stream.html', getStreamPageBaseUrl())
  url.searchParams.set('src', `${DEFAULT_CAMERA_STREAM_PREFIX}${cameraNumber}`)
  return url.toString()
}

export function isStreamPageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname.endsWith('/stream.html') && parsedUrl.searchParams.has('src')
  } catch {
    return false
  }
}
