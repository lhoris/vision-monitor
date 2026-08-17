import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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

function validateUrl(value: string, protocol: DirectProtocol): string | null {
  if (!value.trim()) return 'required'

  let parsed: URL
  try {
    parsed = new URL(value.trim())
  } catch {
    return 'invalid'
  }

  const allowedSchemes = protocol === 'rtsp' ? ['rtsp:'] : ['http:', 'https:']
  if (!allowedSchemes.includes(parsed.protocol)) {
    return `protocol:${protocol}`
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
  const { t } = useTranslation()
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
      if (validationError === 'required') {
        setError(t('live.addCameraDialog.errors.required'))
      } else if (validationError === 'invalid') {
        setError(t('live.addCameraDialog.errors.invalidUrl'))
      } else {
        const [, invalidProtocol] = validationError.split(':')
        setError(t('live.addCameraDialog.errors.invalidProtocol', {
          protocol: t(`live.addCameraDialog.protocols.${invalidProtocol}`),
          schemes: invalidProtocol === 'rtsp' ? 'rtsp:' : 'http:, https:',
        }))
      }
      return
    }

    const duplicate = existingTemporaryUrls.some((existingUrl) => existingUrl.trim() === normalizedUrl && existingUrl !== initialSource?.url)
    if (duplicate) {
      setError(t('live.addCameraDialog.errors.duplicateUrl'))
      return
    }

    onAddDirectSource({
      id: initialSource?.id ?? `temporary-${Date.now()}`,
      url: normalizedUrl,
      protocol,
      displayName: displayName.trim() || t(`live.addCameraDialog.protocols.${protocol}Default`),
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
              {t('live.addCameraDialog.title')}
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('live.addCameraDialog.subtitle')}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={t('common.close')}>
            ×
          </button>
        </header>

        <div className="flex border-b border-gray-200 p-4 dark:border-gray-700" role="tablist" aria-label={t('live.addCameraDialog.modeLabel')}>
          <button type="button" role="tab" aria-selected={mode === 'catalog'} onClick={() => { setMode('catalog'); setError(null) }} className={`flex-1 rounded-l border px-4 py-2 text-sm font-semibold ${mode === 'catalog' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
            {t('live.addCameraDialog.catalogMode')}
          </button>
          <button type="button" role="tab" aria-selected={mode === 'direct'} onClick={() => { setMode('direct'); setError(null) }} className={`flex-1 rounded-r border border-l-0 px-4 py-2 text-sm font-semibold ${mode === 'direct' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
            {t('live.addCameraDialog.directMode')}
          </button>
        </div>

        {mode === 'catalog' ? (
          <>
            <div className="p-4">
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t('live.addCameraDialog.searchPlaceholder')} className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" aria-label={t('live.addCameraDialog.searchLabel')} />
            </div>
            <div className="max-h-80 overflow-y-auto border-t border-gray-100 dark:border-gray-700">
              {filteredCameras.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">{t('live.addCameraDialog.noResults')}</p>
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
                    {usedCameraIds.includes(camera.id) ? t('live.addCameraDialog.alreadyAdded') : t(`common.${camera.status}`, { defaultValue: camera.status })}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleDirectSubmit} className="space-y-4 p-5">
            <div>
              <label htmlFor="direct-video-protocol" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('live.addCameraDialog.protocolLabel')}</label>
              <select id="direct-video-protocol" value={protocol} onChange={(event) => { setProtocol(event.target.value as DirectProtocol); setError(null) }} className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                {(Object.keys({ webrtc: true, rtsp: true, hls: true }) as DirectProtocol[]).map((key) => <option key={key} value={key}>{t(`live.addCameraDialog.protocols.${key}`)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="direct-video-url" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('live.addCameraDialog.urlLabel')}</label>
              <input id="direct-video-url" value={url} onChange={(event) => { setUrl(event.target.value); setError(null) }} placeholder={protocol === 'rtsp' ? 'rtsp://...' : 'https://...'} className="w-full cursor-text rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 caret-blue-600 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:caret-blue-300 dark:placeholder:text-gray-400" autoFocus />
            </div>
            <div>
              <label htmlFor="direct-video-name" className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('live.addCameraDialog.displayNameLabel')} <span className="font-normal text-gray-400">{t('live.addCameraDialog.optional')}</span></label>
              <input id="direct-video-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={t('live.addCameraDialog.displayNamePlaceholder')} className="w-full cursor-text rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 caret-blue-600 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:caret-blue-300 dark:placeholder:text-gray-400" />
            </div>
            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">{t('common.cancel')}</button>
              <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{initialSource ? t('live.addCameraDialog.updateSource') : t('live.addCameraDialog.addSource')}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AddCameraDialog
