import { useEffect, useRef, useState } from 'react'
import type { CameraFocusDto, EventDetailDto } from '@/types/cameraFocus'
import { listMetadataQueries } from '@/services/metadataQueryService'
import { createDefaultMetadataProfile, metadataQueryRegistry } from '@/mocks/metadataQueryRegistry'
import { getMetadataProfile, resetMetadataProfile, saveMetadataProfile } from '@/services/metadataConfigurationService'
import type { MetadataLayoutProfile, MetadataQueryDefinition, MetadataSectionConfig } from '@/types/metadataConfig'
import { ConfirmDialog } from '@/components/Common'
import { MetadataSectionEditor } from './Metadata/MetadataSectionEditor'
import { MetadataSectionRenderer } from './Metadata/MetadataSectionRenderer'

interface FocusMetadataPanelProps {
  camera: CameraFocusDto | null
  error?: string | null
  selectedEventDetail?: EventDetailDto | null
  onSelectEvent?: (eventId: number) => void
}

function currentUserId() {
  return localStorage.getItem('authUsername') || 'anonymous'
}

export function FocusMetadataPanel({ camera, error, selectedEventDetail, onSelectEvent }: FocusMetadataPanelProps) {
  const sourceId = String(camera?.cameraId ?? '1')
  const userId = currentUserId()
  const [profile, setProfile] = useState<MetadataLayoutProfile>(() => createDefaultMetadataProfile(userId, sourceId))
  const [queries, setQueries] = useState<MetadataQueryDefinition[]>(() => metadataQueryRegistry.filter((query) => query.enabled))
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const draggedSectionRef = useRef<string | null>(null)
  const profileChangedRef = useRef(false)
  const [editingSection, setEditingSection] = useState<MetadataSectionConfig | undefined>()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<{ type: 'restore' } | { type: 'remove'; section: MetadataSectionConfig } | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    let disposed = false
    profileChangedRef.current = false
    void Promise.all([getMetadataProfile(userId, sourceId), listMetadataQueries()]).then(([nextProfile, nextQueries]) => {
      if (disposed) return
      if (!profileChangedRef.current) setProfile(nextProfile)
      setQueries(nextQueries)
    })
    return () => { disposed = true }
  }, [sourceId, userId])

  async function persist(nextProfile: MetadataLayoutProfile) {
    setProfile(await saveMetadataProfile(nextProfile))
  }

  async function moveSection(targetId: string) {
    const draggedId = draggedSectionRef.current
    if (!profile || !draggedId || draggedId === targetId) return
    const nextSections = [...profile.sections]
    const fromIndex = nextSections.findIndex((section) => section.id === draggedId)
    const toIndex = nextSections.findIndex((section) => section.id === targetId)
    if (fromIndex < 0 || toIndex < 0) return
    const [moved] = nextSections.splice(fromIndex, 1)
    nextSections.splice(toIndex, 0, moved)
    setDraggedSection(null)
    draggedSectionRef.current = null
    const nextProfile = { ...profile, sections: nextSections }
    profileChangedRef.current = true
    setProfile(nextProfile)
    await persist(nextProfile)
  }

  async function saveSection(section: MetadataSectionConfig) {
    if (!profile) return
    const exists = profile.sections.some((item) => item.id === section.id)
    const sections = exists ? profile.sections.map((item) => item.id === section.id ? section : item) : [...profile.sections, { ...section, order: profile.sections.length }]
    profileChangedRef.current = true
    await persist({ ...profile, sections })
    setIsEditorOpen(false)
    setEditingSection(undefined)
  }

  async function removeSection(sectionId: string) {
    if (!profile) return
    profileChangedRef.current = true
    await persist({ ...profile, sections: profile.sections.filter((section) => section.id !== sectionId) })
  }

  async function confirmPendingAction() {
    if (!pendingConfirmation) return
    setIsConfirming(true)
    try {
      if (pendingConfirmation.type === 'restore') await restoreDefaults()
      else await removeSection(pendingConfirmation.section.id)
      setPendingConfirmation(null)
    } finally {
      setIsConfirming(false)
    }
  }

  async function restoreDefaults() {
    setProfile(await resetMetadataProfile(userId, sourceId))
  }

  function confirmRestoreDefaults() {
    setPendingConfirmation({ type: 'restore' })
  }

  const sections = profile?.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order) ?? []

  return (
    <aside className="w-full border-l border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800 lg:w-[380px]" aria-label="카메라 메타데이터">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">메타데이터</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setEditingSection(undefined); setIsEditorOpen(true) }} className="border px-2 py-1 text-xs text-blue-700 dark:text-blue-300">섹션 추가</button>
          <button type="button" onClick={confirmRestoreDefaults} className="text-xs text-gray-500 underline-offset-2 hover:text-blue-600 hover:underline dark:text-gray-300" title="메타데이터 섹션 기본값 복원">기본값</button>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">영상소스별 섹션을 드래그해 순서를 변경할 수 있습니다.</p>
      {error ? <p className="mt-3 text-xs text-rose-600">{error === 'FORBIDDEN' ? '카메라 정보 접근 권한이 없습니다.' : '카메라 정보를 불러오지 못했습니다.'}</p> : null}
      <div className="mt-4 space-y-3">
        {!error && sections.map((section) => (
          <section key={section.id} draggable onDragStart={() => { draggedSectionRef.current = section.id; setDraggedSection(section.id) }} onDragOver={(event) => event.preventDefault()} onDrop={() => void moveSection(section.id)} onDragEnd={() => { draggedSectionRef.current = null; setDraggedSection(null) }} data-testid={`metadata-section-${section.id}`} className={`border border-gray-200 dark:border-gray-700 ${draggedSection === section.id ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex min-w-0 cursor-grab items-center gap-2 font-semibold text-gray-700 active:cursor-grabbing dark:text-gray-100"><span aria-hidden="true" className="text-gray-400">⠿</span><h3 className="truncate">{section.title}</h3></div>
              <div className="flex shrink-0 gap-2 text-xs"><button type="button" onClick={() => { setEditingSection(section); setIsEditorOpen(true) }} className="text-blue-600 underline">편집</button><button type="button" onClick={() => setPendingConfirmation({ type: 'remove', section })} className="text-rose-600 underline">삭제</button></div>
            </div>
            <div className="p-3"><MetadataSectionRenderer section={section} sourceId={sourceId} active={Boolean(camera)} onSelectEvent={onSelectEvent} /></div>
          </section>
        ))}
        {!error && !profile.sections.length ? <div className="border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">표시할 섹션이 없습니다. 섹션을 추가하거나 기본값을 복원하세요.</div> : null}
      </div>
      {camera?.lastSeenAt === null ? <span className="sr-only">-</span> : null}
      {selectedEventDetail ? <p className="mt-3 text-xs text-slate-500">선택 알람: {selectedEventDetail.title}</p> : null}
      {isEditorOpen ? <MetadataSectionEditor section={editingSection} queries={queries} onSave={(section) => void saveSection(section)} onClose={() => { setIsEditorOpen(false); setEditingSection(undefined) }} /> : null}
      <ConfirmDialog isOpen={Boolean(pendingConfirmation)} title="설정 변경 확인" message={pendingConfirmation?.type === 'restore' ? '현재 영상소스의 메타데이터 섹션 설정을 기본값으로 복원하시겠습니까?' : `'${pendingConfirmation?.section.title ?? ''}' 섹션을 삭제하시겠습니까?'`} confirmLabel="확인" variant={pendingConfirmation?.type === 'remove' ? 'danger' : 'default'} busy={isConfirming} onConfirm={confirmPendingAction} onCancel={() => { if (!isConfirming) setPendingConfirmation(null) }} />
    </aside>
  )
}
