import { useEffect, useState } from 'react'
import { commonCodeService } from '@/services/commonCodeService'
import type { CommonCode, CommonCodeDetail, CommonCodeDetailInput, CommonCodeInput } from '@/types/commonCode'

const emptyCode: CommonCodeInput = { name: '', description: '', type: '', remarks: '' }
const emptyDetail: CommonCodeDetailInput = { value: '', name: '', description: '', sortOrder: 0, defaultValue: '', remarks: '' }

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

  const selectCode = async (code: CommonCode) => { setSelected(code); setDetails(await commonCodeService.listDetails(code.id)) }
  const saveCode = async () => { editingCode ? await commonCodeService.update(editingCode, codeForm) : await commonCodeService.create(codeForm); setCodeModal(false); setEditingCode(null); setCodeForm(emptyCode); await load() }
  const saveDetail = async () => { if (!selected) return; editingDetail ? await commonCodeService.updateDetail(selected.id, editingDetail, detailForm) : await commonCodeService.createDetail(selected.id, detailForm); setDetailModal(false); setEditingDetail(null); setDetailForm(emptyDetail); await load() }
  const startCode = (code?: CommonCode) => { setEditingCode(code?.id ?? null); setCodeForm(code ? { name: code.name, description: code.description ?? '', type: code.type ?? '', remarks: code.remarks ?? '' } : emptyCode); setCodeModal(true) }
  const startDetail = (detail?: CommonCodeDetail) => { if (!selected) return; setEditingDetail(detail?.id ?? null); setDetailForm(detail ? { value: detail.value, name: detail.name, description: detail.description ?? '', sortOrder: detail.sortOrder, defaultValue: detail.defaultValue ?? '', remarks: detail.remarks ?? '' } : emptyDetail); setDetailModal(true) }

  return <section className="flex h-full min-h-0 flex-col bg-slate-50 p-4 dark:bg-slate-950">
    <header className="mb-3 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Admin</p><h1 className="text-2xl font-bold text-slate-900 dark:text-white">공통코드 관리</h1></div><button className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => startCode()}>공통코드 등록</button></header>
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]">
      <div className="min-h-0 overflow-auto rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="border-b p-3 text-sm font-semibold">공통코드</div>{codes.map((code) => <button key={code.id} onClick={() => void selectCode(code)} className={`block w-full border-b px-3 py-3 text-left ${selected?.id === code.id ? 'bg-blue-50 dark:bg-slate-800' : ''}`}><span className="block font-semibold">{code.name}</span><span className="text-xs text-slate-500">{code.description || '-'}</span></button>)}</div>
      <div className="min-h-0 overflow-auto rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between border-b p-3"><div><h2 className="font-semibold">{selected?.name ?? '상세코드'}</h2><span className="text-xs text-slate-500">{details.length}건</span></div><div className="flex gap-2"><button disabled={!selected} className="rounded border px-3 py-1.5 text-sm disabled:opacity-40" onClick={() => startDetail()}>상세 등록</button>{selected && <button className="rounded border px-3 py-1.5 text-sm" onClick={() => startCode(selected)}>수정</button>}{selected && <button className="rounded border px-3 py-1.5 text-sm text-red-600" onClick={() => void commonCodeService.deactivate(selected.id).then(load)}>비활성화</button>}</div></div><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-slate-100 dark:bg-slate-800"><tr><th className="p-3">값</th><th className="p-3">표시명</th><th className="p-3">순서</th><th className="p-3">상태</th><th className="p-3" /></tr></thead><tbody>{details.map((detail) => <tr key={detail.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3 font-mono">{detail.value}</td><td className="p-3">{detail.name}</td><td className="p-3">{detail.sortOrder}</td><td className="p-3">{detail.dataEndStatus === 'N' ? '활성' : '비활성'}</td><td className="p-3 text-right"><button className="mr-2 text-blue-600" onClick={() => startDetail(detail)}>수정</button><button className="text-red-600" onClick={() => selected && void commonCodeService.deactivateDetail(selected.id, detail.id).then(load)}>비활성화</button></td></tr>)}</tbody></table></div>
    </div>
    {codeModal && <Modal title={editingCode ? '공통코드 수정' : '공통코드 등록'} onClose={() => setCodeModal(false)} onSave={() => void saveCode()}><Field label="코드명" value={codeForm.name} onChange={(value) => setCodeForm({ ...codeForm, name: value })} /><Field label="설명" value={codeForm.description ?? ''} onChange={(value) => setCodeForm({ ...codeForm, description: value })} /><Field label="유형" value={codeForm.type ?? ''} onChange={(value) => setCodeForm({ ...codeForm, type: value })} /></Modal>}
    {detailModal && <Modal title={editingDetail ? '상세코드 수정' : '상세코드 등록'} onClose={() => setDetailModal(false)} onSave={() => void saveDetail()}><Field label="코드값" value={detailForm.value} onChange={(value) => setDetailForm({ ...detailForm, value })} /><Field label="표시명" value={detailForm.name} onChange={(value) => setDetailForm({ ...detailForm, name: value })} /><Field label="정렬순서" type="number" value={String(detailForm.sortOrder ?? 0)} onChange={(value) => setDetailForm({ ...detailForm, sortOrder: Number(value) })} /><Field label="기본값" value={detailForm.defaultValue ?? ''} onChange={(value) => setDetailForm({ ...detailForm, defaultValue: value })} /></Modal>}
  </section>
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm"><span className="mb-1 block font-medium">{label}</span><input className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label> }
function Modal({ title, children, onClose, onSave }: { title: string; children: React.ReactNode; onClose: () => void; onSave: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-md rounded bg-white p-5 shadow-xl dark:bg-slate-900"><h2 className="mb-4 text-lg font-semibold">{title}</h2><div className="space-y-3">{children}</div><div className="mt-5 flex justify-end gap-2"><button className="rounded border px-3 py-2 text-sm" onClick={onClose}>취소</button><button className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={onSave}>저장</button></div></div></div> }
