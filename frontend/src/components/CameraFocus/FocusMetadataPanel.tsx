import type { CameraFocusDto, EventDetailDto } from '@/types/cameraFocus'

interface FocusMetadataPanelProps {
  camera: CameraFocusDto | null
  error?: string | null
  selectedEventDetail?: EventDetailDto | null
}

export function FocusMetadataPanel({ camera, error, selectedEventDetail }: FocusMetadataPanelProps) {
  if (selectedEventDetail) {
    return (
      <aside className="w-full border-l border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800 lg:w-[380px]">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">이벤트 상세</h2>
        <dl className="mt-4 space-y-3 text-gray-700 dark:text-gray-200">
          <MetadataRow label="이벤트" value={selectedEventDetail.title} />
          <MetadataRow label="발생 시각" value={selectedEventDetail.occurredAt} />
          <MetadataRow label="종료 시각" value={selectedEventDetail.endedAt} />
          <MetadataRow label="상태" value={selectedEventDetail.status} />
          <MetadataRow label="대응" value={toDisplayValue(selectedEventDetail.metadata.controlResponse)} />
          <MetadataRow label="소재 ID" value={toDisplayValue(selectedEventDetail.metadata.materialId)} />
          <MetadataRow label="냉각 코드" value={toDisplayValue(selectedEventDetail.metadata.coolingCode)} />
          <MetadataRow label="현재 속도" value={toDisplayValue(selectedEventDetail.metadata.currentSpeed)} />
          <MetadataRow label="감지 속도" value={toDisplayValue(selectedEventDetail.metadata.detectedSpeed)} />
        </dl>
      </aside>
    )
  }

  if (error === 'FORBIDDEN') {
    return (
      <aside className="w-full border-l border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800 lg:w-[380px]">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">메타데이터</h2>
        <p className="mt-3 text-red-600 dark:text-red-300">카메라 정보 접근 권한이 없습니다.</p>
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="w-full border-l border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800 lg:w-[380px]">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">메타데이터</h2>
        <p className="mt-3 text-red-600 dark:text-red-300">카메라 정보를 불러오지 못했습니다.</p>
      </aside>
    )
  }

  if (!camera) {
    return (
      <aside className="w-full border-l border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800 lg:w-[380px]">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">메타데이터</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">카메라 정보를 불러오는 중입니다.</p>
      </aside>
    )
  }

  return (
    <aside className="w-full border-l border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800 lg:w-[380px]">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">메타데이터</h2>
      <dl className="mt-4 space-y-3 text-gray-700 dark:text-gray-200">
        <MetadataRow label="카메라" value={camera.cameraName} />
        <MetadataRow label="공정" value={camera.processType} />
        <MetadataRow label="구역" value={camera.zoneName} />
        <MetadataRow label="라인" value={camera.lineName} />
        <MetadataRow label="위치" value={camera.location} />
        <MetadataRow label="상태" value={camera.status} />
        <MetadataRow label="마지막 수신" value={camera.lastSeenAt} />
        <MetadataRow label="최근 이벤트" value={camera.recentEventSummary.lastEventId?.toString() ?? null} />
      </dl>
    </aside>
  )
}

function MetadataRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-right font-medium text-gray-900 dark:text-white">{value || '-'}</dd>
    </div>
  )
}

function toDisplayValue(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return null
}
