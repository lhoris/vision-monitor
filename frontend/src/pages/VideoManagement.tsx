import { useCallback, useEffect, useMemo, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { GridColumnFilterRow, type GridColumnFilter } from '@/components/Common'
import { videoSourceService } from '@/services/videoSourceService'
import type { VideoProtocol, VideoSource, VideoSourceInput, VideoSourceStatus } from '@/types/videoSource'

const VIDEO_PROTOCOLS: VideoProtocol[] = ['WEBRTC', 'HLS']

const emptyForm: VideoSourceInput = {
  name: '',
  url: '',
  protocol: 'WEBRTC',
  location: '',
  zone: '',
  status: 'ACTIVE',
  remarks: '',
}

type FilterKey = 'name' | 'url' | 'protocol' | 'location' | 'zone' | 'status'
type EditableVideoField = keyof VideoSourceInput
type VideoGridRowState = 'clean' | 'dirty'
type VideoGridRow = VideoSource & { rowState: VideoGridRowState }

const headerCell = 'h-8 border-b border-r border-[#9dcced] bg-[#dff2ff] px-2 text-center align-middle text-[13px] font-semibold normal-case text-[#266b9f] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-100'
const bodyCell = 'h-9 border-b border-r border-[#b7d8ee] p-0 align-middle dark:border-slate-700'
const cellValue = 'box-border flex h-9 w-full items-center border border-transparent bg-transparent px-2 text-left text-sm leading-none text-slate-900 outline-none dark:text-slate-100'
const editableCell = 'box-border h-9 w-full rounded-none border border-[#6ab6e8] bg-white px-2 text-sm leading-none text-slate-900 outline-none dark:border-sky-500 dark:bg-slate-900 dark:text-slate-100'

interface VideoSourceModalProps {
  open: boolean
  initialValue: VideoSourceInput
  title: string
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (value: VideoSourceInput) => Promise<void>
}

function normalizeManagedProtocol(protocol: VideoSource['protocol']): VideoProtocol {
  return VIDEO_PROTOCOLS.includes(protocol) ? protocol : 'WEBRTC'
}

function VideoSourceModal({ open, initialValue, title, saving, error, onClose, onSubmit }: VideoSourceModalProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (open) setValue(initialValue)
  }, [initialValue, open])

  if (!open) return null

  const update = (field: keyof VideoSourceInput, next: string) => {
    setValue((current) => ({ ...current, [field]: next }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void onSubmit(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-source-modal-title"
        className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 id="video-source-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="rounded px-2 py-1 text-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="닫기">x</button>
        </header>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-sm text-slate-700 dark:text-slate-200">
            영상 이름
            <input required value={value.name} onChange={(event) => update('name', event.target.value)} className="mt-1 h-9 w-full rounded border border-slate-300 px-2 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            프로토콜
            <select value={value.protocol} onChange={(event) => update('protocol', event.target.value as VideoProtocol)} className="mt-1 h-9 w-full rounded border border-slate-300 px-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
              {VIDEO_PROTOCOLS.map((protocol) => <option key={protocol} value={protocol}>{protocol}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200 sm:col-span-2">
            영상 주소
            <input required value={value.url} onChange={(event) => update('url', event.target.value)} placeholder="https://..." className="mt-1 h-9 w-full rounded border border-slate-300 px-2 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            위치
            <input value={value.location ?? ''} onChange={(event) => update('location', event.target.value)} className="mt-1 h-9 w-full rounded border border-slate-300 px-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            구역
            <input value={value.zone ?? ''} onChange={(event) => update('zone', event.target.value)} className="mt-1 h-9 w-full rounded border border-slate-300 px-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            상태
            <select value={value.status} onChange={(event) => update('status', event.target.value as VideoSourceStatus)} className="mt-1 h-9 w-full rounded border border-slate-300 px-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            비고
            <input value={value.remarks ?? ''} onChange={(event) => update('remarks', event.target.value)} className="mt-1 h-9 w-full rounded border border-slate-300 px-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
          </label>
        </div>

        {error ? <p role="alert" className="px-5 text-sm text-rose-600">{error}</p> : null}
        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <button type="button" onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">취소</button>
          <button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? '저장 중...' : '저장'}</button>
        </footer>
      </form>
    </div>
  )
}

export function VideoManagement() {
  const [rows, setRows] = useState<VideoGridRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [editingCell, setEditingCell] = useState<{ id: number; field: EditableVideoField } | null>(null)
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ name: '', url: '', protocol: '', location: '', zone: '', status: '' })
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalValue, setModalValue] = useState<VideoSourceInput>(emptyForm)
  const [modalError, setModalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setRows((await videoSourceService.list()).map((item) => ({ ...item, rowState: 'clean' })))
      setSelectedIds(new Set())
      setEditingCell(null)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : '영상 목록을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => { setPage(1) }, [filters, pageSize, appliedQuery])
  useEffect(() => {
    if (!notice) return undefined
    const id = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(id)
  }, [notice])
  useEffect(() => {
    if (!contextMenu) return undefined
    const closeContextMenu = () => setContextMenu(null)
    document.addEventListener('click', closeContextMenu)
    return () => document.removeEventListener('click', closeContextMenu)
  }, [contextMenu])

  const filteredRows = useMemo(() => rows.filter((item) => {
    const search = appliedQuery.trim().toLowerCase()
    if (search && ![item.name, item.url, item.location, item.zone].some((field) => (field ?? '').toLowerCase().includes(search))) {
      return false
    }
    return (Object.entries(filters) as [FilterKey, string][]).every(([key, filter]) =>
      !filter || String(item[key] ?? '').toLowerCase().includes(filter.toLowerCase())
    )
  }), [appliedQuery, filters, rows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)
  const changedRows = rows.filter((row) => row.rowState === 'dirty')
  const selectedChangedRows = changedRows.filter((row) => selectedIds.has(row.id))
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((item) => selectedIds.has(item.id))

  const setFilter = (key: FilterKey, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  const toggleRow = (id: number) => setSelectedIds((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const toggleVisible = () => setSelectedIds((current) => {
    const next = new Set(current)
    visibleRows.forEach((item) => allVisibleSelected ? next.delete(item.id) : next.add(item.id))
    return next
  })

  const updateRow = (id: number, field: EditableVideoField, value: string) => {
    setRows((current) => current.map((row) => {
      if (row.id !== id) return row
      return { ...row, [field]: value, rowState: 'dirty' }
    }))
  }

  const cellKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (event.key === 'Enter' || event.key === 'Escape') setEditingCell(null)
  }

  const toInput = (row: VideoGridRow): VideoSourceInput => ({
    name: row.name,
    url: row.url,
    protocol: normalizeManagedProtocol(row.protocol),
    location: row.location ?? '',
    zone: row.zone ?? '',
    status: row.status,
    remarks: row.remarks ?? '',
  })

  const saveRows = async () => {
    const targets = selectedChangedRows.length ? selectedChangedRows : changedRows
    if (!targets.length) return
    setSaving(true)
    try {
      await Promise.all(targets.map((row) => videoSourceService.update(row.id, toInput(row))))
      setNotice(`${targets.length}건을 저장했습니다.`)
      await load()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const openAdd = (value = emptyForm) => {
    setModalValue(value)
    setModalError('')
    setModalOpen(true)
  }

  const save = async (value: VideoSourceInput) => {
    setSaving(true)
    setModalError('')
    try {
      const saved = await videoSourceService.create(value)
      if (!saved) throw new Error('영상 주소 저장에 실패했습니다.')
      setModalOpen(false)
      setNotice('영상 주소를 추가했습니다.')
      await load()
    } catch (exception) {
      setModalError(exception instanceof Error ? exception.message : '영상 주소 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const deleteSelected = async () => {
    if (!selectedIds.size || !window.confirm(`선택한 ${selectedIds.size}건의 영상 주소를 삭제하시겠습니까?`)) return
    setSaving(true)
    try {
      await Promise.all([...selectedIds].map((id) => videoSourceService.remove(id)))
      setNotice(`${selectedIds.size}건을 삭제했습니다.`)
      await load()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : '삭제에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const duplicateSelected = () => {
    const item = rows.find((entry) => selectedIds.has(entry.id))
    if (!item) return
    openAdd({
      name: `${item.name} 복사본`,
      url: item.url,
      protocol: normalizeManagedProtocol(item.protocol),
      location: item.location ?? '',
      zone: item.zone ?? '',
      status: item.status,
      remarks: item.remarks ?? '',
    })
  }

  const openContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY })
  }

  const renderTextCell = (row: VideoGridRow, field: Extract<EditableVideoField, 'name' | 'url' | 'location' | 'zone'>, className = '') => {
    const editing = editingCell?.id === row.id && editingCell.field === field
    const value = String(row[field] ?? '')
    if (editing) {
      return (
        <input
          aria-label={`${field} 편집`}
          autoFocus
          value={value}
          onChange={(event) => updateRow(row.id, field, event.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={cellKeyDown}
          className={`${editableCell} ${className}`}
        />
      )
    }
    return (
      <button type="button" aria-label={`${field} 셀`} onDoubleClick={() => setEditingCell({ id: row.id, field })} className={`${cellValue} ${className}`} title={value}>
        {value || '-'}
      </button>
    )
  }

  const renderSelectCell = (row: VideoGridRow, field: Extract<EditableVideoField, 'protocol' | 'status'>, options: string[]) => {
    const editing = editingCell?.id === row.id && editingCell.field === field
    if (editing) {
      return (
        <select
          aria-label={`${field} 편집`}
          autoFocus
          value={String(row[field])}
          onChange={(event) => {
            updateRow(row.id, field, event.target.value)
            setEditingCell(null)
          }}
          onBlur={() => setEditingCell(null)}
          onKeyDown={cellKeyDown}
          className={editableCell}
        >
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      )
    }
    return (
      <button type="button" aria-label={`${field} 셀`} onDoubleClick={() => setEditingCell({ id: row.id, field })} className={cellValue}>
        {field === 'status' ? <span className={row.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'}>{row.status}</span> : row.protocol}
      </button>
    )
  }

  const columnFilters: GridColumnFilter[] = [
    { id: 'select', ariaLabel: '', kind: 'empty', widthClassName: 'w-12', value: '' },
    { id: 'name', ariaLabel: '영상 이름 필터', value: filters.name, widthClassName: 'w-44', onChange: (value) => setFilter('name', value) },
    { id: 'url', ariaLabel: '영상 주소 필터', value: filters.url, widthClassName: 'w-[30rem]', onChange: (value) => setFilter('url', value) },
    { id: 'protocol', ariaLabel: '프로토콜 필터', kind: 'select', value: filters.protocol, widthClassName: 'w-28', options: [{ value: '', label: '전체' }, ...VIDEO_PROTOCOLS.map((value) => ({ value, label: value }))], onChange: (value) => setFilter('protocol', value) },
    { id: 'location', ariaLabel: '위치 필터', value: filters.location, widthClassName: 'w-36', onChange: (value) => setFilter('location', value) },
    { id: 'zone', ariaLabel: '구역 필터', value: filters.zone, widthClassName: 'w-28', onChange: (value) => setFilter('zone', value) },
    { id: 'status', ariaLabel: '상태 필터', kind: 'select', value: filters.status, widthClassName: 'w-28', options: [{ value: '', label: '전체' }, { value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }], onChange: (value) => setFilter('status', value) },
  ]

  return (
    <section className="flex h-full min-h-0 flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">관리자 메뉴</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">영상 관리</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">영상 주소 목록을 그리드에서 관리합니다.</p>
        </div>
      </div>

      {notice ? <div role="status" className="fixed right-6 top-20 z-40 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg">{notice}</div> : null}
      {error ? <div role="alert" className="fixed right-6 top-20 z-40 rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg">{error}</div> : null}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); setAppliedQuery(query) }}>
          <label htmlFor="video-search" className="text-sm font-medium text-slate-700 dark:text-slate-200">영상</label>
          <input id="video-search" aria-label="영상 검색" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 주소 입력" className="h-8 w-64 rounded border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
        </form>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setAppliedQuery(query)} disabled={saving} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">조회</button>
          <button type="button" onClick={() => void saveRows()} disabled={saving || changedRows.length === 0} className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">저장</button>
          <button type="button" onClick={() => openAdd()} disabled={saving} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">추가</button>
          <button type="button" onClick={duplicateSelected} disabled={selectedIds.size !== 1 || saving} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">복제</button>
          <button type="button" onClick={() => void deleteSelected()} disabled={!selectedIds.size || saving} className="rounded border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/30">삭제</button>
          <button type="button" onClick={() => void load()} disabled={saving} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">새로고침</button>
        </div>
      </div>

      <section className="relative flex min-h-0 flex-1 flex-col border border-[#9dcced] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
        {contextMenu ? (
          <div role="menu" className="fixed z-50 min-w-36 rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800" style={{ left: contextMenu.x, top: contextMenu.y }}>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setFiltersVisible((current) => !current)
                setContextMenu(null)
              }}
              className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {filtersVisible ? '검색/필터 숨기기' : '검색/필터'}
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto" onContextMenu={openContextMenu}>
          <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm dark:border-slate-700">
            <thead className="sticky top-0 z-10 text-xs font-semibold uppercase">
              <tr>
                <th className={`w-12 ${headerCell}`}><input aria-label="전체 선택" type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} /></th>
                <th className={`w-44 ${headerCell}`}>영상 이름</th>
                <th className={`w-[30rem] ${headerCell}`}>영상 주소</th>
                <th className={`w-28 ${headerCell}`}>프로토콜</th>
                <th className={`w-36 ${headerCell}`}>위치</th>
                <th className={`w-28 ${headerCell}`}>구역</th>
                <th className={`w-28 ${headerCell}`}>상태</th>
              </tr>
              {filtersVisible ? <GridColumnFilterRow filters={columnFilters} /> : null}
            </thead>
            <tbody>
              {visibleRows.map((item) => (
                <tr key={item.id} className={`${selectedIds.has(item.id) ? 'bg-[#d6edff] dark:bg-sky-950/40' : 'bg-white dark:bg-slate-800'} h-9 text-slate-800 hover:bg-[#eef8ff] dark:text-slate-100 dark:hover:bg-slate-700`}>
                  <td className={`${bodyCell} text-center`}><input aria-label={`${item.name} 선택`} type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleRow(item.id)} /></td>
                  <td className={bodyCell}>{renderTextCell(item, 'name', 'font-medium')}</td>
                  <td className={bodyCell}>{renderTextCell(item, 'url', 'truncate font-mono text-xs')}</td>
                  <td className={bodyCell}>{renderSelectCell(item, 'protocol', VIDEO_PROTOCOLS)}</td>
                  <td className={bodyCell}>{renderTextCell(item, 'location')}</td>
                  <td className={bodyCell}>{renderTextCell(item, 'zone')}</td>
                  <td className={bodyCell}>{renderSelectCell(item, 'status', ['ACTIVE', 'INACTIVE'])}</td>
                </tr>
              ))}
              {!visibleRows.length ? <tr><td colSpan={7} className="p-10 text-center text-sm text-slate-500">조건에 맞는 영상 주소가 없습니다.</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <span>선택 {selectedIds.size}건</span>
          <span className="text-slate-300">|</span>
          <span>전체 {filteredRows.length}건</span>
          <span className="text-slate-300">|</span>
          <span>변경 {changedRows.length}건</span>
          <span className="ml-auto">표시 건수</span>
          <select aria-label="표시 건수" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button type="button" aria-label="이전 페이지" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50">이전</button>
          <span>{safePage} / {totalPages}</span>
          <button type="button" aria-label="다음 페이지" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage >= totalPages} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50">다음</button>
        </div>
      </section>

      <VideoSourceModal open={modalOpen} initialValue={modalValue} title="영상 추가" saving={saving} error={modalError} onClose={() => setModalOpen(false)} onSubmit={save} />
    </section>
  )
}

export default VideoManagement
