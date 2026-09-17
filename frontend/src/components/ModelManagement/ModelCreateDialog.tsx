import { useState } from 'react'
import { Modal } from '@/components/Common'
import { Button } from '@/components/Common/Button'
import type { ModelCreateInput, ProcessArea } from '@/types/modelManagement'

const initial: ModelCreateInput = { processId: '', modelName: '', automationName: '', serverIp: '', pythonProjectPath: '' }
export function ModelCreateDialog({ areas, onClose, onSave }: { areas: ProcessArea[]; onClose: () => void; onSave: (input: ModelCreateInput) => Promise<void> }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const update = (key: keyof ModelCreateInput, value: string) => setForm((current) => ({ ...current, [key]: value }))
  return <Modal isOpen title="모델 추가" onClose={onClose} className="max-w-xl"><div className="space-y-3">{[['modelName', '모델명'], ['automationName', '조업 자동화 기술명'], ['serverIp', '모델 서버 IP'], ['pythonProjectPath', 'Python 프로젝트 경로']].map(([key, label]) => <label key={key} className="block text-sm font-medium">{label}<input value={form[key as keyof ModelCreateInput]} onChange={(event) => update(key as keyof ModelCreateInput, event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700" /></label>)}<label className="block text-sm font-medium">공정<select value={form.processId} onChange={(event) => update('processId', event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"><option value="">선택</option>{areas.filter((area) => !area.isAll).map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>취소</Button><Button onClick={() => void onSave(form).catch((reason: Error) => setError(reason.message))}>추가</Button></div></div></Modal>
}
