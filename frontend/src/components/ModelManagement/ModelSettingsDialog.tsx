import { useEffect, useState } from 'react'
import { Modal } from '@/components/Common'
import { Button } from '@/components/Common/Button'
import type { ModelProcess } from '@/types/modelManagement'

export function ModelSettingsDialog({ process, onClose, onSave }: { process: ModelProcess | null; onClose: () => void; onSave: (serverIp: string, pythonProjectPath: string) => Promise<void> }) {
  const [serverIp, setServerIp] = useState(process?.serverIp ?? '')
  const [pythonProjectPath, setPythonProjectPath] = useState(process?.pythonProjectPath ?? '')
  const [error, setError] = useState('')
  useEffect(() => {
    setServerIp(process?.serverIp ?? '')
    setPythonProjectPath(process?.pythonProjectPath ?? '')
    setError('')
  }, [process])
  if (!process) return null
  return <Modal isOpen title={`${process.modelName} 설정`} onClose={onClose} className="max-w-xl"><div className="space-y-4"><label className="block text-sm font-medium">모델 서버 IP<input value={serverIp} onChange={(event) => setServerIp(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700" /></label><label className="block text-sm font-medium">Python 프로젝트 경로<input value={pythonProjectPath} onChange={(event) => setPythonProjectPath(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700" /></label>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>취소</Button><Button onClick={() => void onSave(serverIp, pythonProjectPath).catch((reason: Error) => setError(reason.message))}>저장</Button></div></div></Modal>
}
