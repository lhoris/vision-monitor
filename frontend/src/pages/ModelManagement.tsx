import { useEffect, useMemo, useState } from 'react'
import { Button, ConfirmDialog } from '@/components/Common'
import { ModelCreateDialog, ModelEventLogDialog, ModelManagementFilters, ModelProcessControlDialog, ModelProcessEventLogBar, ModelProcessGrid, ModelSettingsDialog, ModelVmDashboard, ProcessAreaCreateDialog, ProcessMultiSelectFilter } from '@/components/ModelManagement'
import { controlProcess, createProcess, createProcessArea, listEventLogs, listProcesses, updateSettings } from '@/services/modelManagementService'
import type { ModelControlAction, ModelDashboard, ModelEventLog, ModelCreateInput, ModelProcess, ModelVm, ProcessArea, ProcessStatus } from '@/types/modelManagement'

type ViewMode = 'dashboard' | 'grid'

function groupProcesses(processes: ModelProcess[]): ModelDashboard {
  const grouped = new Map<string, ModelProcess[]>()
  processes.forEach((process) => {
    const key = process.serverIp || 'unknown'
    grouped.set(key, [...(grouped.get(key) ?? []), process])
  })
  const vms: ModelVm[] = [...grouped.entries()].map(([hostAddress, items]) => ({
    vmId: `vm-${hostAddress.replace(/[^a-zA-Z0-9]/g, '-')}`,
    vmName: items[0]?.vmName || `AI VM ${hostAddress}`,
    hostAddress,
    connectionStatus: items.some((item) => item.monitoringStatus === 'failed') ? 'disconnected' : items.some((item) => item.monitoringStatus === 'checking') ? 'checking' : items.some((item) => item.monitoringStatus === 'normal') ? 'connected' : 'unknown',
    lastHeartbeatAt: (() => { const values = items.map((item) => item.lastStatusAt).filter(Boolean).sort(); return values[values.length - 1] })(),
    processes: items,
  }))
  return { vms, refreshedAt: new Date().toISOString() }
}

export function ModelManagement() {
  const [areas, setAreas] = useState<ProcessArea[]>([])
  const [processes, setProcesses] = useState<ModelProcess[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(['all'])
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [status, setStatus] = useState<ProcessStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [settingsProcess, setSettingsProcess] = useState<ModelProcess | null>(null)
  const [logProcess, setLogProcess] = useState<ModelProcess | null>(null)
  const [logs, setLogs] = useState<ModelEventLog[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [createAreaOpen, setCreateAreaOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ process: ModelProcess; action: ModelControlAction } | null>(null)
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null)
  const [controlDialogProcessId, setControlDialogProcessId] = useState<string | null>(null)

  useEffect(() => {
    void listProcesses().then((result) => { setAreas(result.processAreas); setProcesses(result.processes) }).catch(() => setError('모델 목록을 불러오지 못했습니다.')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  const filteredProcesses = useMemo(() => {
    const query = search.trim().toLowerCase()
    return processes.filter((process) => {
      const areaMatch = selectedIds.includes('all') || selectedIds.includes(process.processId)
      const statusMatch = status === 'all' || process.processStatus === status
      const searchMatch = !query || [process.serverIp, process.vmName, process.processName, process.modelName, process.automationName].some((value) => value?.toLowerCase().includes(query))
      return areaMatch && statusMatch && searchMatch
    })
  }, [processes, search, selectedIds, status])
  const dashboard = useMemo(() => groupProcesses(filteredProcesses), [filteredProcesses])
  const selectedProcess = useMemo(() => filteredProcesses.find((process) => process.id === selectedProcessId) ?? null, [filteredProcesses, selectedProcessId])
  const controlDialogProcess = useMemo(() => processes.find((process) => process.id === controlDialogProcessId) ?? null, [controlDialogProcessId, processes])

  useEffect(() => {
    if (selectedProcessId && !selectedProcess) setSelectedProcessId(null)
  }, [selectedProcess, selectedProcessId])

  const requestControl = (id: string, action: ModelControlAction) => {
    const process = processes.find((item) => item.id === id)
    if (process) setPendingAction({ process, action })
  }

  const runControl = async () => {
    if (!pendingAction) return
    const { process, action } = pendingAction
    const actionLabel = { start: '시작', stop: '정지', restart: '재시작' }[action]
    setPendingAction(null)
    setError('')
    setBusyIds((current) => new Set(current).add(process.id))
    try {
      const updated = await controlProcess(process.id, action)
      setProcesses((current) => current.map((item) => item.id === updated.id ? updated : item))
      setNotice(`${process.modelName} 프로세스를 ${actionLabel} 요청했습니다.`)
    } catch (controlError) {
      setError(controlError instanceof Error ? controlError.message : '프로세스 조작에 실패했습니다.')
    } finally {
      setBusyIds((current) => { const next = new Set(current); next.delete(process.id); return next })
    }
  }

  const saveSettings = async (serverIp: string, pythonProjectPath: string) => {
    if (!settingsProcess) return
    const updated = await updateSettings(settingsProcess.id, { serverIp, pythonProjectPath })
    setProcesses((current) => current.map((item) => item.id === updated.id ? updated : item))
    setSettingsProcess(null)
    setNotice('모델 설정을 저장했습니다.')
  }

  const loadLogs = async (process: ModelProcess) => {
    setLogs(await listEventLogs(process.id))
  }

  const openLogs = async (process: ModelProcess) => {
    setLogProcess(process)
    await loadLogs(process)
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
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">모델 관리</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">VM과 Python AI 모델 프로세스의 운영 상태를 확인하고 제어합니다.</p></div>{viewMode === 'grid' && <Button onClick={() => setCreateOpen(true)}>모델 추가</Button>}</div>
    <div className="flex justify-end"><div className="flex items-center gap-1 rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-600 dark:bg-slate-800"><button type="button" onClick={() => setViewMode('dashboard')} className={`rounded px-3 py-1.5 ${viewMode === 'dashboard' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500'}`}>대시보드</button><button type="button" onClick={() => setViewMode('grid')} className={`rounded px-3 py-1.5 ${viewMode === 'grid' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500'}`}>관리 그리드</button></div></div>
    {viewMode === 'grid' && <section className="border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"><div className="mb-3"><h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">운영 대상 필터</h2><span className="text-xs text-slate-500">공정은 다중 선택할 수 있습니다.</span></div><div className="space-y-3"><ProcessMultiSelectFilter areas={areas} selectedIds={selectedIds} onChange={setSelectedIds} onAdd={() => setCreateAreaOpen(true)} /><ModelManagementFilters status={status} search={search} onStatusChange={setStatus} onSearchChange={setSearch} /></div></section>}
    {notice && <div role="status" className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notice}</div>}
    {error && <div role="alert" className="rounded border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>}
    {loading ? <div className="flex flex-1 items-center justify-center text-sm text-slate-500">모델 목록을 불러오는 중입니다.</div> : viewMode === 'dashboard' ? <div className="flex min-h-0 flex-1 flex-col gap-3"><div className="min-h-0 flex-1"><ModelVmDashboard vms={dashboard.vms} selectedProcessId={selectedProcessId ?? undefined} onSelect={(process) => { setSelectedProcessId(process.id); void loadLogs(process) }} onDoubleSelect={(process) => setControlDialogProcessId(process.id)} /></div><ModelProcessEventLogBar process={selectedProcess} logs={logs} /></div> : <ModelProcessGrid processes={filteredProcesses} busyIds={busyIds} onControl={requestControl} onSettings={setSettingsProcess} onLogs={(process) => void openLogs(process)} />}
    <div className="flex items-center justify-between text-xs text-slate-500"><span>{selectedIds.includes('all') ? 'ALL' : areas.filter((area) => selectedIds.includes(area.id)).map((area) => area.name).join(', ')}</span><span>총 {filteredProcesses.length}건 · 마지막 조회 {dashboard.refreshedAt ? new Date(dashboard.refreshedAt).toLocaleTimeString('ko-KR') : '-'}</span></div>
    <ModelSettingsDialog process={settingsProcess} onClose={() => setSettingsProcess(null)} onSave={saveSettings} />
    <ModelEventLogDialog process={logProcess} logs={logs} onClose={() => setLogProcess(null)} />
    <ModelProcessControlDialog process={controlDialogProcess} busy={controlDialogProcess ? busyIds.has(controlDialogProcess.id) : false} onClose={() => setControlDialogProcessId(null)} onControl={(action) => { if (controlDialogProcess) requestControl(controlDialogProcess.id, action) }} onSettings={() => { if (controlDialogProcess) { setControlDialogProcessId(null); setSettingsProcess(controlDialogProcess) } }} onLogs={() => { if (controlDialogProcess) { setControlDialogProcessId(null); void openLogs(controlDialogProcess) } }} />
    {createOpen && <ModelCreateDialog areas={areas} onClose={() => setCreateOpen(false)} onSave={saveNewProcess} />}
    {createAreaOpen && <ProcessAreaCreateDialog onClose={() => setCreateAreaOpen(false)} onSave={saveNewArea} />}
    <ConfirmDialog isOpen={Boolean(pendingAction)} title="프로세스 제어 확인" message={pendingAction ? `${pendingAction.process.modelName} 프로세스를 ${({ start: '시작', stop: '정지', restart: '재시작' }[pendingAction.action])} 요청하시겠습니까?` : ''} confirmLabel="요청" cancelLabel="취소" busy={false} onCancel={() => setPendingAction(null)} onConfirm={runControl} />
  </div>
}

export default ModelManagement
