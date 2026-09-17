import { useEffect, useState, type ReactNode } from 'react'
import { commonCodeService } from '@/services/commonCodeService'
import type { CommonCode, CommonCodeDetail, CommonCodeDetailInput, CommonCodeInput } from '@/types/commonCode'

const emptyCode: CommonCodeInput = { name: '', description: '', type: '', remarks: '' }
const emptyDetail: CommonCodeDetailInput = {
  value: '',
  name: '',
  nameKo: '',
  nameEn: '',
  description: '',
  sortOrder: 0,
  defaultValue: '',
  remarks: '',
}

const headerCell = 'h-9 border-b border-r border-[#9dcced] bg-[#dff2ff] px-2 text-center text-xs font-semibold text-[#266b9f] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-100'
const bodyCell = 'h-9 border-b border-r border-[#b7d8ee] px-2 align-middle dark:border-slate-700'

export default function CommonCodeManagement() {
  const [codes, setCodes] = useState<CommonCode[]>([])
  const [selected, setSelected] = useState<CommonCode | null>(null)
  const [details, setDetails] = useState<CommonCodeDetail[]>([])
  const [codeForm, setCodeForm] = useState<CommonCodeInput>(emptyCode)
  const [detailForm, setDetailForm] = useState<CommonCodeDetailInput>(emptyDetail)
  const [editingCode, setEditingCode] = useState<number | null>(null)
  const [editingDetail, setEditingDetail] = useState<number | null>(null)
  const [codeModal, setCodeModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)

  const load = async () => {
    const result = await commonCodeService.listAdmin()
    setCodes(result)
    const next = selected ? result.find((code) => code.id === selected.id) ?? result[0] : result[0]
    setSelected(next ?? null)
    if (next) setDetails(await commonCodeService.listDetails(next.id))
    else setDetails([])
  }

  useEffect(() => { void load() }, [])

  const selectCode = async (code: CommonCode) => {
    setSelected(code)
    setDetails(await commonCodeService.listDetails(code.id))
  }

  const saveCode = async () => {
    if (editingCode) await commonCodeService.update(editingCode, codeForm)
    else await commonCodeService.create(codeForm)
    setCodeModal(false)
    setEditingCode(null)
    setCodeForm(emptyCode)
    await load()
  }

  const saveDetail = async () => {
    if (!selected) return
    if (editingDetail) await commonCodeService.updateDetail(selected.id, editingDetail, detailForm)
    else await commonCodeService.createDetail(selected.id, detailForm)
    setDetailModal(false)
    setEditingDetail(null)
    setDetailForm(emptyDetail)
    await load()
  }

  const startCode = (code?: CommonCode) => {
    setEditingCode(code?.id ?? null)
    setCodeForm(code ? {
      name: code.name,
      description: code.description ?? '',
      type: code.type ?? '',
      remarks: code.remarks ?? '',
    } : emptyCode)
    setCodeModal(true)
  }

  const startDetail = (detail?: CommonCodeDetail) => {
    if (!selected) return
    setEditingDetail(detail?.id ?? null)
    setDetailForm(detail ? {
      value: detail.value,
      name: detail.name,
      nameKo: detail.nameKo ?? '',
      nameEn: detail.nameEn ?? '',
      description: detail.description ?? '',
      sortOrder: detail.sortOrder,
      defaultValue: detail.defaultValue ?? '',
      remarks: detail.remarks ?? '',
    } : emptyDetail)
    setDetailModal(true)
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">관리자 메뉴</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">공통코드 관리</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">공통코드와 상세코드를 그리드에서 관리합니다.</p>
        </div>
        <button className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => startCode()}>
          공통코드 등록
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.6fr)]">
        <section className="relative flex min-h-0 flex-col border border-[#9dcced] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-12 items-center justify-between border-b border-slate-200 px-3 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">공통코드</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">전체 {codes.length}건</span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[520px] table-fixed border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm dark:border-slate-700">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className={`w-40 ${headerCell}`}>코드명</th>
                  <th className={`w-56 ${headerCell}`}>설명</th>
                  <th className={`w-20 ${headerCell}`}>상태</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr
                    key={code.id}
                    onClick={() => void selectCode(code)}
                    className={`${selected?.id === code.id ? 'bg-[#d6edff] dark:bg-sky-950/40' : 'bg-white dark:bg-slate-800'} h-9 cursor-pointer text-slate-800 hover:bg-[#eef8ff] dark:text-slate-100 dark:hover:bg-slate-700`}
                  >
                    <td className={`${bodyCell} truncate font-mono font-semibold`} title={code.name}>{code.name}</td>
                    <td className={`${bodyCell} truncate`} title={code.description ?? ''}>{code.description || '-'}</td>
                    <td className={`${bodyCell} text-center`}>
                      <span className={code.dataEndStatus === 'N' ? 'text-emerald-600' : 'text-slate-500'}>{code.dataEndStatus === 'N' ? '활성' : '비활성'}</span>
                    </td>
                  </tr>
                ))}
                {!codes.length ? <tr><td colSpan={3} className="p-8 text-center text-sm text-slate-500">등록된 공통코드가 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="relative flex min-h-0 flex-col border border-[#9dcced] bg-white shadow-none dark:border-slate-700 dark:bg-slate-800">
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{selected?.name ?? '상세코드'}</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">상세 {details.length}건</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={!selected} className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-600" onClick={() => startDetail()}>상세 등록</button>
              {selected ? <button className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600" onClick={() => startCode(selected)}>공통코드 수정</button> : null}
              {selected && selected.dataEndStatus === 'N' ? (
                <button className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700 dark:border-rose-700 dark:text-rose-300" onClick={() => void commonCodeService.deactivate(selected.id).then(load)}>비활성화</button>
              ) : null}
              {selected && selected.dataEndStatus === 'Y' ? (
                <button className="rounded border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700 dark:border-emerald-700 dark:text-emerald-300" onClick={() => void commonCodeService.activate(selected.id).then(load)}>활성화</button>
              ) : null}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[980px] table-fixed border-separate border-spacing-0 border-l border-t border-[#9dcced] text-left text-sm dark:border-slate-700">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className={`w-44 ${headerCell}`}>코드값</th>
                  <th className={`w-44 ${headerCell}`}>기본 표시명</th>
                  <th className={`w-44 ${headerCell}`}>한국어</th>
                  <th className={`w-56 ${headerCell}`}>영어</th>
                  <th className={`w-20 ${headerCell}`}>순서</th>
                  <th className={`w-20 ${headerCell}`}>상태</th>
                  <th className={`w-28 ${headerCell}`}>작업</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail) => (
                  <tr key={detail.id} className="h-9 bg-white text-slate-800 hover:bg-[#eef8ff] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                    <td className={`${bodyCell} truncate font-mono font-semibold`} title={detail.value}>{detail.value}</td>
                    <td className={`${bodyCell} truncate`} title={detail.name}>{detail.name}</td>
                    <td className={`${bodyCell} truncate`} title={detail.nameKo ?? ''}>{detail.nameKo || '-'}</td>
                    <td className={`${bodyCell} truncate`} title={detail.nameEn ?? ''}>{detail.nameEn || '-'}</td>
                    <td className={`${bodyCell} text-center`}>{detail.sortOrder}</td>
                    <td className={`${bodyCell} text-center`}>
                      <span className={detail.dataEndStatus === 'N' ? 'text-emerald-600' : 'text-slate-500'}>{detail.dataEndStatus === 'N' ? '활성' : '비활성'}</span>
                    </td>
                    <td className={`${bodyCell} text-center`}>
                      <button className="mr-2 text-blue-600 hover:underline" onClick={() => startDetail(detail)}>수정</button>
                      {detail.dataEndStatus === 'N' ? (
                        <button className="text-rose-600 hover:underline" onClick={() => selected && void commonCodeService.deactivateDetail(selected.id, detail.id).then(load)}>비활성화</button>
                      ) : (
                        <button className="text-emerald-600 hover:underline" onClick={() => selected && void commonCodeService.activateDetail(selected.id, detail.id).then(load)}>활성화</button>
                      )}
                    </td>
                  </tr>
                ))}
                {!details.length ? <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">조회된 상세코드가 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {codeModal ? (
        <Modal title={editingCode ? '공통코드 수정' : '공통코드 등록'} onClose={() => setCodeModal(false)} onSave={() => void saveCode()}>
          <Field label="코드명" value={codeForm.name} onChange={(value) => setCodeForm({ ...codeForm, name: value })} />
          <Field label="설명" value={codeForm.description ?? ''} onChange={(value) => setCodeForm({ ...codeForm, description: value })} />
          <Field label="유형" value={codeForm.type ?? ''} onChange={(value) => setCodeForm({ ...codeForm, type: value })} />
        </Modal>
      ) : null}

      {detailModal ? (
        <Modal title={editingDetail ? '상세코드 수정' : '상세코드 등록'} onClose={() => setDetailModal(false)} onSave={() => void saveDetail()}>
          <Field label="코드값" value={detailForm.value} onChange={(value) => setDetailForm({ ...detailForm, value })} />
          <Field label="기본 표시명" value={detailForm.name} onChange={(value) => setDetailForm({ ...detailForm, name: value })} />
          <Field label="한국어 표시명" value={detailForm.nameKo ?? ''} onChange={(value) => setDetailForm({ ...detailForm, nameKo: value })} />
          <Field label="영어 표시명" value={detailForm.nameEn ?? ''} onChange={(value) => setDetailForm({ ...detailForm, nameEn: value })} />
          <Field label="정렬순서" type="number" value={String(detailForm.sortOrder ?? 0)} onChange={(value) => setDetailForm({ ...detailForm, sortOrder: Number(value) })} />
          <Field label="기본값" value={detailForm.defaultValue ?? ''} onChange={(value) => setDetailForm({ ...detailForm, defaultValue: value })} />
        </Modal>
      ) : null}
    </section>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Modal({ title, children, onClose, onSave }: { title: string; children: ReactNode; onClose: () => void; onSave: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white p-5 shadow-xl dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <div className="space-y-3">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={onClose}>취소</button>
          <button className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={onSave}>저장</button>
        </div>
      </div>
    </div>
  )
}
