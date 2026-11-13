import { useCallback, useEffect, useMemo, useState } from 'react'
import { ConfirmDialog, DataGridActionButton, DataGridTable, DataGridToolbar, Toast } from '@/components/Common'
import { commonCodeService } from '@/services/commonCodeService'
import { useDataGridSelection } from '@/hooks/useDataGridSelection'
import type { CommonCode, CommonCodeDetail, CommonCodeDetailInput, CommonCodeInput } from '@/types/commonCode'

type RowState = 'clean' | 'dirty' | 'new'
type CodeRow = CommonCode & { rowState: RowState }
type DetailRow = CommonCodeDetail & { rowState: RowState }
type EditingCell = { scope: 'code' | 'detail'; id: number; field: string } | null
type PendingAction = { scope: 'code' | 'detail'; ids: number[]; hardDelete: boolean } | null

const headerCell = 'h-8 border-b border-r border-[#9dcced] bg-[#dff2ff] px-2 text-center text-xs font-semibold text-[#266b9f] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-100'
const bodyCell = 'h-9 border-b border-r border-[#b7d8ee] p-0 align-middle dark:border-slate-700'
const cellValue = 'grid-cell-value box-border flex h-9 w-full items-center border border-transparent bg-transparent px-2 text-left text-sm leading-none text-slate-900 outline-none hover:border-[#9dcced] hover:bg-[#eef8ff] dark:text-slate-100 dark:hover:border-sky-700 dark:hover:bg-slate-700'
const editCell = 'box-border h-9 w-full rounded-none border border-[#6ab6e8] bg-white px-2 text-sm text-slate-900 outline-none dark:border-sky-500 dark:bg-slate-900 dark:text-slate-100'

function toCodeInput(row: CodeRow): CommonCodeInput { return { name: row.name, description: row.description ?? '', type: row.type ?? '', remarks: row.remarks ?? '' } }
function toDetailInput(row: DetailRow): CommonCodeDetailInput { return { value: row.value, name: row.name, nameKo: row.nameKo ?? '', nameEn: row.nameEn ?? '', description: row.description ?? '', sortOrder: row.sortOrder, defaultValue: row.defaultValue ?? '', remarks: row.remarks ?? '' } }

export default function CommonCodeManagement() {
  const [codes, setCodes] = useState<CodeRow[]>([])
  const [details, setDetails] = useState<DetailRow[]>([])
  const [selectedCodeId, setSelectedCodeId] = useState<number | null>(null)
  const [editing, setEditing] = useState<EditingCell>(null)
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingSave, setPendingSave] = useState<'code' | 'detail' | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [pendingActivation, setPendingActivation] = useState<{ scope: 'code' | 'detail'; id: number } | null>(null)

  const codeSelection = useDataGridSelection(codes.map((row) => row.id))
  const detailSelection = useDataGridSelection(details.map((row) => row.id))
  const clearDetailSelection = detailSelection.clear
  const selectedCode = codes.find((row) => row.id === selectedCodeId) ?? null
  const selectedCodeRows = codes.filter((row) => codeSelection.selectedIds.has(row.id))
  const selectedDetailRows = details.filter((row) => detailSelection.selectedIds.has(row.id))
  const codeChanged = codes.filter((row) => row.rowState !== 'clean')
  const detailChanged = details.filter((row) => row.rowState !== 'clean')
  const visibleCodes = useMemo(() => {
    const term = appliedQuery.trim().toLowerCase()
    return codes.filter((row) => !term || [row.name, row.description, row.type, row.remarks].some((value) => (value ?? '').toLowerCase().includes(term)))
  }, [appliedQuery, codes])

  const loadDetails = useCallback(async (codeId: number | null) => {
    if (!codeId || codeId < 0) { setDetails([]); clearDetailSelection(); return }
    const result = await commonCodeService.listDetails(codeId)
    setDetails(result.map((row) => ({ ...row, rowState: 'clean' as RowState })))
    clearDetailSelection()
  }, [clearDetailSelection])

  const load = useCallback(async () => {
    setBusy(true); setError('')
    try {
      const result = (await commonCodeService.listAdmin()).map((row) => ({ ...row, rowState: 'clean' as RowState }))
      setCodes(result)
      const nextId = result.some((row) => row.id === selectedCodeId) ? selectedCodeId : result[0]?.id ?? null
      setSelectedCodeId(nextId)
      await loadDetails(nextId)
      setEditing(null); setNotice('공통코드 목록을 조회했습니다.')
    } catch (exception) { setError(exception instanceof Error ? exception.message : '공통코드 목록을 불러오지 못했습니다.') } finally { setBusy(false) }
  }, [loadDetails, selectedCodeId])

  useEffect(() => { void load() }, [])
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 3000); return () => window.clearTimeout(timer) }, [notice])

  const updateCode = (id: number, field: keyof CommonCodeInput, value: string) => { setCodes((current) => current.map((row) => row.id === id ? { ...row, [field]: value, rowState: row.rowState === 'new' ? 'new' : 'dirty' } : row)); codeSelection.select(id) }
  const updateDetail = (id: number, field: keyof CommonCodeDetailInput, value: string | number) => { setDetails((current) => current.map((row) => row.id === id ? { ...row, [field]: value, rowState: row.rowState === 'new' ? 'new' : 'dirty' } : row)); detailSelection.select(id) }
  const addCode = () => { const id = -Date.now(); const row: CodeRow = { id, name: '', description: '', type: '', remarks: '', dataEndStatus: 'N', details: [], items: [], rowState: 'new' }; setCodes((current) => [row, ...current]); setSelectedCodeId(id); setDetails([]); codeSelection.select(id); setEditing({ scope: 'code', id, field: 'name' }) }
  const duplicateCode = () => { const source = selectedCodeRows.length === 1 ? selectedCodeRows[0] : selectedCode; if (!source) return; const id = -Date.now(); const row: CodeRow = { ...source, id, name: `${source.name}_COPY`, dataEndStatus: 'N', details: [], rowState: 'new' }; setCodes((current) => [row, ...current]); setSelectedCodeId(id); setDetails([]); codeSelection.select(id) }
  const addDetail = () => { if (!selectedCode || selectedCode.id < 0) return; const id = -Date.now(); const row: DetailRow = { id, codeId: selectedCode.id, value: '', name: '', nameKo: '', nameEn: '', description: '', sortOrder: details.length, defaultValue: '', remarks: '', dataEndStatus: 'N', rowState: 'new' }; setDetails((current) => [row, ...current]); detailSelection.select(id); setEditing({ scope: 'detail', id, field: 'value' }) }
  const duplicateDetail = () => { const source = selectedDetailRows.length === 1 ? selectedDetailRows[0] : null; if (!source) return; const id = -Date.now(); const row: DetailRow = { ...source, id, value: `${source.value}_COPY`, dataEndStatus: 'N', rowState: 'new' }; setDetails((current) => [row, ...current]); detailSelection.select(id) }
  const deleteDrafts = (scope: 'code' | 'detail') => { if (scope === 'code') { const ids = new Set(codes.filter((row) => codeSelection.selectedIds.has(row.id) && row.rowState === 'new').map((row) => row.id)); setCodes((current) => current.filter((row) => !ids.has(row.id))); if (ids.has(selectedCodeId ?? 0)) { setSelectedCodeId(null); setDetails([]) }; codeSelection.clear() } else { const ids = new Set(details.filter((row) => detailSelection.selectedIds.has(row.id) && row.rowState === 'new').map((row) => row.id)); setDetails((current) => current.filter((row) => !ids.has(row.id))); detailSelection.clear() } }

  const saveCodes = () => { if (codeChanged.length) setPendingSave('code') }
  const saveDetails = () => { if (detailChanged.length && selectedCode && selectedCode.id > 0) setPendingSave('detail') }
  const confirmSave = async () => { if (!pendingSave) return; const scope = pendingSave; setPendingSave(null); setBusy(true); try { if (scope === 'code') await Promise.all(codeChanged.map((row) => row.rowState === 'new' ? commonCodeService.create(toCodeInput(row)) : commonCodeService.update(row.id, toCodeInput(row)))); else if (selectedCode) await Promise.all(detailChanged.map((row) => row.rowState === 'new' ? commonCodeService.createDetail(selectedCode.id, toDetailInput(row)) : commonCodeService.updateDetail(selectedCode.id, row.id, toDetailInput(row)))); setNotice(scope === 'code' ? '공통코드를 저장했습니다.' : '상세코드를 저장했습니다.'); await load() } catch (exception) { setError(exception instanceof Error ? exception.message : '저장에 실패했습니다.') } finally { setBusy(false) } }
  const requestDelete = (scope: 'code' | 'detail') => { const rows = scope === 'code' ? selectedCodeRows.filter((row) => row.rowState !== 'new') : selectedDetailRows.filter((row) => row.rowState !== 'new'); if (!rows.length) return; setPendingAction({ scope, ids: rows.map((row) => row.id), hardDelete: rows.every((row) => row.dataEndStatus === 'Y') }) }
  const confirmDelete = async () => { if (!pendingAction || !selectedCode) return; const action = pendingAction; setPendingAction(null); setBusy(true); try { if (action.scope === 'code') await Promise.all(action.ids.map((id) => action.hardDelete ? commonCodeService.remove(id) : commonCodeService.deactivate(id))); else await Promise.all(action.ids.map((id) => action.hardDelete ? commonCodeService.removeDetail(selectedCode.id, id) : commonCodeService.deactivateDetail(selectedCode.id, id))); setNotice(action.hardDelete ? '선택한 데이터를 삭제했습니다.' : '선택한 데이터를 비활성화했습니다.'); await load() } catch (exception) { setError(exception instanceof Error ? exception.message : '삭제 처리에 실패했습니다.') } finally { setBusy(false) } }
  const confirmActivation = async () => { if (!pendingActivation || !selectedCode) return; const action = pendingActivation; setPendingActivation(null); setBusy(true); try { if (action.scope === 'code') await commonCodeService.activate(action.id); else await commonCodeService.activateDetail(selectedCode.id, action.id); setNotice('선택한 데이터를 활성화했습니다.'); await load() } catch (exception) { setError(exception instanceof Error ? exception.message : '활성화에 실패했습니다.') } finally { setBusy(false) } }

  const renderText = (scope: 'code' | 'detail', row: CodeRow | DetailRow, field: keyof CommonCodeInput | keyof CommonCodeDetailInput) => { const value = String((row as unknown as Record<string, unknown>)[String(field)] ?? ''); const isEditing = editing?.scope === scope && editing.id === row.id && editing.field === field; if (isEditing) return <input autoFocus value={value} onChange={(event) => scope === 'code' ? updateCode(row.id, field as keyof CommonCodeInput, event.target.value) : updateDetail(row.id, field as keyof CommonCodeDetailInput, event.target.value)} onBlur={() => setEditing(null)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === 'Escape') setEditing(null) }} className={editCell} />; return <button type="button" onDoubleClick={() => setEditing({ scope, id: row.id, field: String(field) })} className={`${cellValue} ${field === 'name' || field === 'value' ? 'font-mono font-semibold' : ''}`} title={value}>{value || '-'}</button> }
  const renderStatus = (scope: 'code' | 'detail', row: CodeRow | DetailRow) => row.dataEndStatus === 'N' ? <span className="flex h-9 items-center justify-center text-sm text-emerald-600">활성</span> : <button type="button" className="flex h-9 w-full items-center justify-center text-sm text-slate-500 hover:text-emerald-600" onClick={() => setPendingActivation({ scope, id: row.id })}>비활성</button>
  const selectionCount = (selection: Set<number>) => selection.size

  return <section className="flex h-full min-h-0 flex-col gap-4 overflow-auto bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
    <header><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">관리자 메뉴</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">공통코드 관리</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">공통코드와 상세코드를 그리드에서 관리합니다.</p></header>
    <Toast message={notice} variant="success" onClose={() => setNotice('')} /><Toast message={error} variant="error" onClose={() => setError('')} />
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.6fr)]">
      <section className="relative flex min-h-0 flex-col border border-[#9dcced] bg-white dark:border-slate-700 dark:bg-slate-800" data-onboarding="common-code-list">
        <DataGridToolbar><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="코드명 또는 설명 검색" className="h-8 min-w-0 flex-1 rounded border border-slate-300 px-2 text-sm dark:border-slate-600 dark:bg-slate-900" /><DataGridActionButton onClick={() => { setAppliedQuery(query); setNotice('공통코드 목록을 조회했습니다.') }}>조회</DataGridActionButton><DataGridActionButton variant="primary" onClick={saveCodes} disabled={!codeChanged.length || busy}>저장</DataGridActionButton><DataGridActionButton variant="danger" onClick={() => requestDelete('code')} disabled={!selectedCodeRows.some((row) => row.rowState !== 'new') || busy}>삭제</DataGridActionButton></DataGridToolbar>
        <div className="min-h-0 flex-1 overflow-auto"><DataGridTable className="w-full min-w-[520px] border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm"><thead className="sticky top-0 z-10"><tr><th className={`w-10 ${headerCell}`}><input aria-label="공통코드 전체 선택" type="checkbox" checked={codeSelection.allVisibleSelected} onChange={codeSelection.toggleVisible} /></th><th className={`w-40 ${headerCell}`}>코드명</th><th className={`w-56 ${headerCell}`}>설명</th><th className={`w-20 ${headerCell}`}>상태</th></tr></thead><tbody>{visibleCodes.map((row) => <tr key={row.id} onClick={() => { setSelectedCodeId(row.id); void loadDetails(row.id) }} className={`${selectedCodeId === row.id ? 'bg-[#d6edff] dark:bg-sky-950/40' : 'bg-white dark:bg-slate-800'} h-9 text-slate-800 dark:text-slate-100`}><td className={`${bodyCell} text-center`}><input aria-label={`${row.name || '신규 공통코드'} 선택`} type="checkbox" checked={codeSelection.selectedIds.has(row.id)} onClick={(event) => event.stopPropagation()} onChange={() => codeSelection.toggle(row.id)} /></td><td className={bodyCell}>{renderText('code', row, 'name')}</td><td className={bodyCell}>{renderText('code', row, 'description')}</td><td className={bodyCell}>{renderStatus('code', row)}</td></tr>)}{!visibleCodes.length ? <tr><td colSpan={4} className="p-8 text-center text-sm text-slate-500">조회된 공통코드가 없습니다.</td></tr> : null}</tbody></DataGridTable></div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"><button type="button" onClick={addCode} disabled={busy} className="rounded border border-slate-300 px-2 py-1 font-medium">행 추가</button><button type="button" onClick={duplicateCode} disabled={!selectedCode || busy} className="rounded border border-slate-300 px-2 py-1 font-medium">행 복제</button><button type="button" onClick={() => deleteDrafts('code')} disabled={!selectedCodeRows.some((row) => row.rowState === 'new') || busy} className="rounded border border-rose-300 px-2 py-1 font-medium text-rose-700">행 삭제</button><button type="button" onClick={() => void load()} disabled={busy} className="rounded border border-slate-300 px-2 py-1 font-medium">새로고침</button><span className="ml-auto">선택 {selectionCount(codeSelection.selectedIds)}건 | 전체 {visibleCodes.length}건 | 변경 {codeChanged.length}건</span></div>
      </section>
      <section className="relative flex min-h-0 flex-col border border-[#9dcced] bg-white dark:border-slate-700 dark:bg-slate-800" data-onboarding="common-code-detail">
        <DataGridToolbar><span className="min-w-0 flex-1 truncate font-semibold text-slate-900 dark:text-white">{selectedCode?.name ?? '상세코드'}</span><DataGridActionButton onClick={addDetail} disabled={!selectedCode || selectedCode.id < 0 || busy}>상세 등록</DataGridActionButton><DataGridActionButton variant="primary" onClick={saveDetails} disabled={!detailChanged.length || busy}>저장</DataGridActionButton><DataGridActionButton variant="danger" onClick={() => requestDelete('detail')} disabled={!selectedDetailRows.some((row) => row.rowState !== 'new') || busy}>삭제</DataGridActionButton></DataGridToolbar>
        <div className="min-h-0 flex-1 overflow-auto"><DataGridTable className="w-full min-w-[980px] border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm"><thead className="sticky top-0 z-10"><tr><th className={`w-10 ${headerCell}`}><input aria-label="상세코드 전체 선택" type="checkbox" checked={detailSelection.allVisibleSelected} onChange={detailSelection.toggleVisible} /></th><th className={`w-40 ${headerCell}`}>코드값</th><th className={`w-40 ${headerCell}`}>기본 표시명</th><th className={`w-40 ${headerCell}`}>한국어</th><th className={`w-48 ${headerCell}`}>영어</th><th className={`w-20 ${headerCell}`}>순서</th><th className={`w-20 ${headerCell}`}>상태</th></tr></thead><tbody>{details.map((row) => <tr key={row.id} className="h-9 bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100"><td className={`${bodyCell} text-center`}><input aria-label={`${row.value || '신규 상세코드'} 선택`} type="checkbox" checked={detailSelection.selectedIds.has(row.id)} onChange={() => detailSelection.toggle(row.id)} /></td><td className={bodyCell}>{renderText('detail', row, 'value')}</td><td className={bodyCell}>{renderText('detail', row, 'name')}</td><td className={bodyCell}>{renderText('detail', row, 'nameKo')}</td><td className={bodyCell}>{renderText('detail', row, 'nameEn')}</td><td className={`${bodyCell} text-center`}>{renderText('detail', row, 'sortOrder')}</td><td className={bodyCell}>{renderStatus('detail', row)}</td></tr>)}{!details.length ? <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">조회된 상세코드가 없습니다.</td></tr> : null}</tbody></DataGridTable></div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"><button type="button" onClick={addDetail} disabled={!selectedCode || selectedCode.id < 0 || busy} className="rounded border border-slate-300 px-2 py-1 font-medium">행 추가</button><button type="button" onClick={duplicateDetail} disabled={selectedDetailRows.length !== 1 || busy} className="rounded border border-slate-300 px-2 py-1 font-medium">행 복제</button><button type="button" onClick={() => deleteDrafts('detail')} disabled={!selectedDetailRows.some((row) => row.rowState === 'new') || busy} className="rounded border border-rose-300 px-2 py-1 font-medium text-rose-700">행 삭제</button><button type="button" onClick={() => selectedCode && void loadDetails(selectedCode.id)} disabled={!selectedCode || busy} className="rounded border border-slate-300 px-2 py-1 font-medium">새로고침</button><span className="ml-auto">선택 {selectionCount(detailSelection.selectedIds)}건 | 전체 {details.length}건 | 변경 {detailChanged.length}건</span></div>
      </section>
    </div>
    <ConfirmDialog isOpen={Boolean(pendingSave)} title="저장 확인" message={`${pendingSave === 'code' ? '공통코드' : '상세코드'} 변경사항을 저장하시겠습니까?`} confirmLabel="확인" cancelLabel="취소" busy={busy} onCancel={() => { if (!busy) setPendingSave(null) }} onConfirm={confirmSave} />
    <ConfirmDialog isOpen={Boolean(pendingAction)} title={pendingAction?.hardDelete ? '삭제 확인' : '비활성화 확인'} message={pendingAction ? `${pendingAction.ids.length}건을 ${pendingAction.hardDelete ? '영구 삭제' : '비활성화'}하시겠습니까?` : ''} confirmLabel={pendingAction?.hardDelete ? '삭제' : '비활성화'} cancelLabel="취소" variant="danger" busy={busy} onCancel={() => { if (!busy) setPendingAction(null) }} onConfirm={confirmDelete} />
    <ConfirmDialog isOpen={Boolean(pendingActivation)} title="활성화 확인" message="선택한 데이터를 활성화하시겠습니까?" confirmLabel="활성화" cancelLabel="취소" busy={busy} onCancel={() => { if (!busy) setPendingActivation(null) }} onConfirm={confirmActivation} />
  </section>
}
