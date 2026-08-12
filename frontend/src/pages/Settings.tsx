/**
 * Settings Page
 * 카메라 설정 및 관리 UI
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  Modal,
} from '@/components/Common'
import { useAppSelector, useAppDispatch } from '@/store'
import {
  addCamera,
  updateCameraAsync,
  deleteCameraAsync,
} from '@/store/slices/cameraSlice'
import type { Camera } from '@/types/camera'

export function Settings() {
  const dispatch = useAppDispatch()
  const { t, i18n } = useTranslation()
  const cameras = useAppSelector((state) => state.camera.cameras)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null)

  // 디버깅: 번역 제대로 로드되는지 확인
  const [formData, setFormData] = useState<Omit<Camera, 'id'>>({
    name: '',
    location: '',
    zone: '',
    streamUrl: '',
    status: 'offline',
    streamProtocol: undefined,
  })

  const handleAddClick = () => {
    setEditingCamera(null)
    setFormData({
      name: '',
      location: '',
      zone: '',
      streamUrl: '',
      status: 'offline',
      streamProtocol: undefined,
    })
    setIsModalOpen(true)
  }

  const handleEditClick = (camera: Camera) => {
    setEditingCamera(camera)
    setFormData({
      name: camera.name,
      location: camera.location,
      zone: camera.zone,
      streamUrl: camera.streamUrl,
      status: camera.status,
      streamProtocol: camera.streamProtocol,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (editingCamera) {
      dispatch(
        updateCameraAsync({
          id: editingCamera.id,
          camera: formData,
        })
      )
    } else {
      dispatch(
        addCamera({
          id: Math.max(...cameras.map((c) => c.id), 0) + 1,
          ...formData,
        })
      )
    }
    setIsModalOpen(false)
  }

  const handleDelete = (cameraId: number) => {
    if (window.confirm(t('settings.areYouSure'))) {
      dispatch(deleteCameraAsync(cameraId))
    }
  }

  const zoneOptions = [
    { value: 'Zone 1', label: t('zones.zone1') },
    { value: 'Zone 2', label: t('zones.zone2') },
    { value: 'Zone 3', label: t('zones.zone3') },
    { value: 'Zone 4', label: t('zones.zone4') },
  ]

  const statusOptions = [
    { value: 'online', label: t('common.online') },
    { value: 'offline', label: t('common.offline') },
    { value: 'error', label: t('common.error') },
  ]

  const protocolOptions = [
    { value: 'hls', label: t('settings.protocols.hls') },
    { value: 'webrtc', label: t('settings.protocols.webrtc') },
    { value: 'rtsp', label: t('settings.protocols.rtsp') },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('settings.subtitle')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Current language: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{i18n.language}</span>
            | Test: <span className="font-mono">{t('settings.cameras')}</span>
          </p>
        </div>
        <Button onClick={handleAddClick}>{t('settings.addCamera')}</Button>
      </div>

      {/* Cameras Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('settings.cameras')}
        </h2>
        {cameras.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('settings.noCameras')}
              </p>
              <Button onClick={handleAddClick}>{t('settings.addFirstCamera')}</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {cameras.map((camera) => (
              <Card key={camera.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {camera.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {camera.location} • {camera.zone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
                        {camera.streamUrl}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span
                          className={`
                            px-2 py-1 rounded-full font-medium
                            ${
                              camera.status === 'online'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : camera.status === 'offline'
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }
                          `}
                        >
                          {camera.status.charAt(0).toUpperCase() +
                            camera.status.slice(1)}
                        </span>
                        {camera.resolution && (
                          <span className="text-gray-600 dark:text-gray-400">
                            {camera.resolution}
                          </span>
                        )}
                        {camera.fps && (
                          <span className="text-gray-600 dark:text-gray-400">
                            {camera.fps} FPS
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditClick(camera)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(camera.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* System Settings Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('settings.systemPreferences')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('settings.recordingSettings')}
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {t('settings.enableAutoRecording')}
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {t('settings.archiveOldRecordings')}
                  </span>
                </label>
              </div>
              <Select
                label={t('settings.retentionPeriod')}
                options={[
                  { value: '7', label: t('retentionPeriods.7days') },
                  { value: '30', label: t('retentionPeriods.30days') },
                  { value: '90', label: t('retentionPeriods.90days') },
                  { value: '365', label: t('retentionPeriods.1year') },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('settings.notificationSettings')}
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {t('settings.emailNotifications')}
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {t('settings.smsAlerts')}
                  </span>
                </label>
              </div>
              <Input
                type="email"
                label={t('settings.notificationEmail')}
                placeholder="admin@example.com"
              />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCamera ? t('settings.editCamera') : t('settings.addCamera')}
      >
        <div className="space-y-4">
          <Input
            label={t('settings.cameraName')}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Camera 1"
          />
          <Input
            label={t('settings.location')}
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="e.g., Area A"
          />
          <Select
            label={t('settings.zone')}
            options={zoneOptions}
            value={formData.zone}
            onChange={(e) =>
              setFormData({ ...formData, zone: e.target.value })
            }
          />
          <Input
            label={t('settings.streamUrl')}
            value={formData.streamUrl}
            onChange={(e) =>
              setFormData({ ...formData, streamUrl: e.target.value })
            }
            placeholder="rtsp://example.com/stream"
          />
          <Select
            label={t('settings.streamProtocol')}
            options={protocolOptions}
            value={formData.streamProtocol || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                streamProtocol: (e.target.value || undefined) as 'hls' | 'webrtc' | 'rtsp' | undefined,
              })
            }
          />
          <Select
            label={t('settings.status')}
            options={statusOptions}
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'online' | 'offline' | 'error',
              })
            }
          />

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleSave}>
              {editingCamera ? t('settings.updateCamera') : t('settings.addCamera')}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
