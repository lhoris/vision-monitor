import React, { useEffect, useMemo, useState } from 'react'
import type { Camera } from '@/types/camera'
import type { TemporaryVideoSource, StreamProtocol } from '@/types/streamPlayer'

type DirectProtocol = Exclude<StreamProtocol, 'unknown'>

interface AddCameraDialogProps {
  isOpen: boolean
  cameras: Camera[]
  usedCameraIds: number[]
  existingTemporaryUrls?: string[]
  initialSource?: TemporaryVideoSource
  onSelectCamera: (camera: Camera) => void
  onAddDirectSource: (source: TemporaryVideoSource) => void
  onClose: () => void
}

const protocolLabels: Record<DirectProtocol, string> = {
  webrtc: 'WebRTC',
  rtsp: 'RTSP',
  hls: 'HLS',
}

function validateUrl(value: string, protocol: DirectProtocol): string | null {
  if (!value.trim()) return '영상 주소를 입력하세요.'

  let parsed: URL
  try {
    parsed = new URL(value.trim())
  } catch {
    return '올바른 영상 주소를 입력하세요.'
  }

  const allowedSchemes = protocol === 'rtsp' ? ['rtsp:'] : ['http:', 'https:']
  if (!allowedSchemes.includes(parsed.protocol)) {
    return `${protocolLabels[protocol]}는 ${allowedSchemes.join(', ')} 주소를 사용해야 합니다.`
  }

  return null
}

export const AddCameraDialog: React.FC<AddCameraDialogProps> = ({
  isOpen,
  cameras,
  usedCameraIds,
  existingTemporaryUrls = [],
  initialSource,
  onSelectCamera,
  onAddDirectSource,
  onClose,
}) => {
  const [mode, setMode] = useState<'catalog' | 'direct'>(initialSource ? 'direct' : 'catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [protocol, setProtocol] = useState<DirectProtocol>(initialSource?.protocol ?? 'webrtc')
  const [url, setUrl] = useState(initialSource?.url ?? '')
  const [displayName, setDisplayName] = useState(initialSource?.displayName ?? '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setMode(initialSource ? 'direct' : 'catalog')
    setProtocol(initialSource?.protocol ?? 'webrtc')
    setUrl(initialSource?.url ?? '')
    setDisplayName(initialSource?.displayName ?? '')
    setSearchTerm('')
    setError(null)
  }, [isOpen, initialSource])

  const filteredCameras = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return cameras
      .filter((camera) =>
        !term || [camera.name, camera.location, camera.zone].some((value) => value.toLowerCase().includes(term))
      )
  }, [cameras, searchTerm, usedCameraIds])

  if (!isOpen) return null

  const handleDirectSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedUrl = url.trim()
    const validationError = validateUrl(normalizedUrl, protocol)
    if (validationError) {
      setError(validationError)
      return
    }

    const duplicate = existingTemporaryUrls.some((existingUrl) => existingUrl.trim() === normalizedUrl && existingUrl !== initialSource?.url)
    if (duplicate) {
      setError('같은 영상 주소가 현재 세부공정에 이미 추가되어 있습니다.')
      return
    }

    onAddDirectSource({
      id: initialSource?.id ?? `temporary-${Date.now()}`,
      url: normalizedUrl,
      protocol,
      displayName: displayName.trim() || `${protocolLabels[protocol]} 영상`,
      playbackStatus: initialSource?.playbackStatus ?? 'idle',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-[min(560px,100%)] overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-800" role="dialog" aria-modal="true" aria-labelledby="add-camera-dialog-title">
        <header className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
          <div>
            <h2 id="add-camera-dialog-title" className="text-xl font-bold text-gray-900 dark:text-white">
              영상 추가
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">카메라 목록 또는 임의 영상 주소를 선택하세요.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="닫기">
            ×
          </button>
        </header>

        <div className="flex border-b border-gray-200 p-4 dark:border-gray-700" role="tablist" aria-label="영상 추가 방식">
          <button type="button" role="tab" aria-selected={mode === 'catalog'} onClick={() => { setMode('catalog'); setError(null) }} className={`flex-1 rounded-l border px-4 py-2 text-sm font-semibold ${mode === 'catalog' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
            카메라 목록
          </button>
          <button type="button" role="tab" aria-selected={mode === 'direct'} onClick={() => { setMode('direct'); setError(null) }} className={`flex-1 rounded-r border border-l-0 px-4 py-2 text-sm font-semibold ${mode === 'direct' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
            영상 주소 직접 입력
          </button>
        </div>

        {mode === 'catalog' ? (
          <>
            <div className="p-4">
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="카메라 검색" className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" aria-label="카메라 검색" />
            </div>
            <div className="max-h-80 overflow-y-auto border-t border-gray-100 dark:border-gray-700">
              {filteredCameras.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</p>
              ) : filteredCameras.map((camera) => (
                <button
                  key={camera.id}
                  type="button"
                  disabled={usedCameraIds.includes(camera.id)}
                  onClick={() => { onSelectCamera(camera); onClose() }}
                  className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-700 dark:disabled:bg-gray-900"
                >
                  <span className="min-w-0">
                    <strong className="block truncate text-sm text-gray-900 dark:text-white">{camera.name}</strong>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{camera.location} · {camera.zone}</span>
                  </span>
                  <span className={`ml-3 shrink-0 text-xs font-semibold ${usedCameraIds.includes(camera.id) ? 'text-gray-500' : camera.status === 'online' ? 'text-green-600' : 'text-red-500'}`}>
                    {usedCameraIds.includes(camera.id) ? '이미 추가됨' : camera.status}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleDirectSubmit} className="space-y-4 p-5">
            <div>
              <label htmlFor="direct-video-protocol" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">프로토콜</label>
              <select id="direct-video-protocol" value={protocol} onChange={(event) => { setProtocol(event.target.value as DirectProtocol); setError(null) }} className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {(Object.keys(protocolLabels) as DirectProtocol[]).map((key) => <option key={key} value={key}>{protocolLabels[key]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="direct-video-url" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">영상 주소</label>
              <input id="direct-video-url" value={url} onChange={(event) => { setUrl(event.target.value); setError(null) }} placeholder={protocol === 'rtsp' ? 'rtsp://...' : 'https://...'} className="w-full cursor-text rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 caret-blue-600 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:caret-blue-300 dark:placeholder:text-gray-400" autoFocus />
            </div>
            <div>
              <label htmlFor="direct-video-name" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">표시 제목 <span className="font-normal text-gray-400">(선택)</span></label>
              <input id="direct-video-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="예: 외부 설비 모니터링" className="w-full cursor-text rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 caret-blue-600 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:caret-blue-300 dark:placeholder:text-gray-400" />
            </div>
            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">취소</button>
              <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{initialSource ? '주소 수정' : '영상 추가'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AddCameraDialog
