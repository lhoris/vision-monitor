import { useState } from 'react'
import { Button, Modal } from '@/components/Common'

export function ProcessAreaCreateDialog({ onClose, onSave }: { onClose: () => void; onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const submit = () => void onSave(name).catch((reason: Error) => setError(reason.message))
  return <Modal isOpen title="공정 추가" onClose={onClose} className="max-w-md"><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit() }}><label className="block text-sm font-medium">공정명<input autoFocus value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700" placeholder="예: 품질" /></label>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>취소</Button><Button type="submit">추가</Button></div></form></Modal>
}
