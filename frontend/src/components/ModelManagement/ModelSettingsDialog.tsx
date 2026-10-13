import { useEffect, useState } from 'react'
import { Modal } from '@/components/Common'
import { Button } from '@/components/Common/Button'
import type { ModelProcess } from '@/types/modelManagement'

const DEFAULT_CONFIG = '{\n  \n}'

function configStorageKey(processId: string) {
  return `vision-monitor:model-config:${processId}`
}

export function ModelSettingsDialog({ process, onClose, onSave }: { process: ModelProcess | null; onClose: () => void; onSave: (serverIp: string, pythonProjectPath: string) => Promise<void> }) {
  const [serverIp, setServerIp] = useState(process?.serverIp ?? '')
  const [pythonProjectPath, setPythonProjectPath] = useState(process?.pythonProjectPath ?? '')
  const [configJson, setConfigJson] = useState(DEFAULT_CONFIG)
  const [error, setError] = useState('')

  useEffect(() => {
    setServerIp(process?.serverIp ?? '')
    setPythonProjectPath(process?.pythonProjectPath ?? '')
    setError('')
    if (!process) return
    try {
      setConfigJson(localStorage.getItem(configStorageKey(process.id)) ?? DEFAULT_CONFIG)
    } catch {
      setConfigJson(DEFAULT_CONFIG)
    }
  }, [process])

  if (!process) return null

  const save = async () => {
    try {
      JSON.parse(configJson)
    } catch {
      setError('config.json 형식이 올바른 JSON이 아닙니다.')
      return
    }
    try {
      await onSave(serverIp, pythonProjectPath)
      localStorage.setItem(configStorageKey(process.id), configJson)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '설정 저장에 실패했습니다.')
    }
  }

  return <Modal isOpen title={`${process.modelName} 설정`} onClose={onClose} className="max-w-2xl">
    <div className="space-y-4">
      <label className="block text-sm font-medium">모델 서버 IP
        <input value={serverIp} onChange={(event) => setServerIp(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700" />
      </label>
      <label className="block text-sm font-medium">Python 프로젝트 경로
        <input value={pythonProjectPath} onChange={(event) => setPythonProjectPath(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700" />
      </label>
      <label className="block text-sm font-medium">config.json
        <textarea value={configJson} onChange={(event) => setConfigJson(event.target.value)} spellCheck={false} rows={12} className="mt-1 w-full resize-y rounded border border-slate-300 bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-600" aria-label="config.json 편집" />
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">현재는 화면 편집 단계이며, Python VM의 실제 파일 반영은 Agent 연동 후 적용됩니다.</p>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>취소</Button><Button onClick={() => void save()}>저장</Button></div>
    </div>
  </Modal>
}
