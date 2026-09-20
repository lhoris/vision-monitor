import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/Common'
import { ModelCreateDialog, ModelEventLogDialog, ModelProcessGrid, ModelSettingsDialog, ProcessAreaCreateDialog, ProcessMultiSelectFilter } from '@/components/ModelManagement'
import { controlProcess, createProcess, createProcessArea, listEventLogs, listProcesses, updateSettings } from '@/services/modelManagementService'
import type { ModelControlAction, ModelEventLog, ModelProcess, ModelCreateInput, ProcessArea } from '@/types/modelManagement'

export function ModelManagement() {
  const [areas, setAreas] = useState<ProcessArea[]>([])
  const [processes, setProcesses] = useState<ModelProcess[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(['all'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [settingsProcess, setSettingsProcess] = useState<ModelProcess | null>(null)
  const [logProcess, setLogProcess] = useState<ModelProcess | null>(null)
  const [logs, setLogs] = useState<ModelEventLog[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [createAreaOpen, setCreateAreaOpen] = useState(false)

  useEffect(() => {
    void listProcesses().then((result) => { setAreas(result.processAreas); setProcesses(result.processes) }).catch(() => setError('모델 목록을 불러오지 못했습니다.')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  const visibleProcesses = useMemo(() => selectedIds.includes('all') ? processes : processes.filter((process) => selectedIds.includes(process.processId)), [processes, selectedIds])

  const runControl = async (id: string, action: ModelControlAction) => {
    const process = processes.find((item) => item.id === id)
    if (!process) return
    const actionLabel = { start: '시작', stop: '정지', restart: '재시작' }[action]
    if (!window.confirm(`${process.modelName} 프로세스를 ${actionLabel}하시겠습니까?`)) return
    setError('')
    setBusyIds((current) => new Set(current).add(id))
    try {
      const updated = await controlProcess(id, action)
      setProcesses((current) => current.map((item) => item.id === id ? updated : item))
      setNotice(`${process.modelName} 프로세스를 ${actionLabel}했습니다.`)
    } catch (controlError) {
      setError(controlError instanceof Error ? controlError.message : '프로세스 조작에 실패했습니다.')
    } finally {
      setBusyIds((current) => { const next = new Set(current); next.delete(id); return next })
    }
  }

  const saveSettings = async (serverIp: string, pythonProjectPath: string) => {
    if (!settingsProcess) return
    const updated = await updateSettings(settingsProcess.id, { serverIp, pythonProjectPath })
    setProcesses((current) => current.map((item) => item.id === updated.id ? updated : item))
    setSettingsProcess(null)
    setNotice('모델 설정을 저장했습니다.')
  }

  const openLogs = async (process: ModelProcess) => {
    setLogProcess(process)
    setLogs(await listEventLogs(process.id))
  }

  const saveNewProcess = async (input: ModelCreateInput) => {
    const created = await createProcess(input)
    setProcesses((current) => [...current, created])
    setCreateOpen(false)
    setNotice('신규 모델을 추가했습니다.')
  }

  const saveNewArea = async (name: string) => {
    const created = await createProcessArea(name)
    setAreas((current) => [...current, created])
    setCreateAreaOpen(false)
    setNotice(`공정 '${created.name}'을 추가했습니다.`)
  }

  return <div className="flex h-full min-h-0 flex-col gap-4 bg-gray-50 p-6 dark:bg-gray-900">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">모델 관리</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Python 모델 프로세스와 제어 연동 상태를 확인합니다.</p></div><Button onClick={() => setCreateOpen(true)}>모델 추가</Button></div>
    <section className="border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">공정 선택</h2><span className="text-xs text-slate-500">다중 선택 필터</span></div><ProcessMultiSelectFilter areas={areas} selectedIds={selectedIds} onChange={setSelectedIds} onAdd={() => setCreateAreaOpen(true)} /></section>
    {notice && <div role="status" className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notice}</div>}
    {error && <div role="alert" className="rounded border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>}
    {loading ? <div className="flex flex-1 items-center justify-center text-sm text-slate-500">모델 목록을 불러오는 중입니다.</div> : <ModelProcessGrid processes={visibleProcesses} busyIds={busyIds} onControl={(id, action) => void runControl(id, action)} onSettings={setSettingsProcess} onLogs={(process) => void openLogs(process)} />}
    <div className="flex items-center justify-between text-xs text-slate-500"><span>{selectedIds.includes('all') ? 'ALL' : areas.filter((area) => selectedIds.includes(area.id)).map((area) => area.name).join(', ')}</span><span>총 {visibleProcesses.length}건</span></div>
    <ModelSettingsDialog process={settingsProcess} onClose={() => setSettingsProcess(null)} onSave={saveSettings} />
    <ModelEventLogDialog process={logProcess} logs={logs} onClose={() => setLogProcess(null)} />
    {createOpen && <ModelCreateDialog areas={areas} onClose={() => setCreateOpen(false)} onSave={saveNewProcess} />}
    {createAreaOpen && <ProcessAreaCreateDialog onClose={() => setCreateAreaOpen(false)} onSave={saveNewArea} />}
  </div>
}

export default ModelManagement
