import { useEffect, useState } from 'react'
import type { ModelControlAction, ModelProcess, ModelVm } from '@/types/modelManagement'
import { ModelProcessHoneycomb } from './ModelProcessHoneycomb'
import { vmStatusLabel } from './modelManagementUi'

type GroupTone = 'sky' | 'emerald' | 'amber' | 'violet'

interface ModelVmDashboardProps {
  vms: ModelVm[]
  selectedProcessId?: string
  controlDialogOpen?: boolean
  onSelect: (process: ModelProcess) => void
  onClearSelection?: () => void
  onDoubleSelect?: (process: ModelProcess) => void
  onContextAction?: (process: ModelProcess, action: ModelControlAction) => void
  onAdd: () => void
  onRefresh?: () => void
  refreshing?: boolean
}

const tones: GroupTone[] = ['sky', 'emerald', 'amber', 'violet']
const autoColors: Record<GroupTone, string> = { sky: '#0ea5e9', emerald: '#10b981', amber: '#f59e0b', violet: '#8b5cf6' }
const colorPalette = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316']

function getStorageKey() {
  const username = typeof window === 'undefined' ? 'anonymous' : localStorage.getItem('authUsername') || 'anonymous'
  return `vision-monitor:model-vm-colors:${username}`
}

export function ModelVmDashboard({ vms, selectedProcessId, controlDialogOpen = false, onSelect, onClearSelection, onDoubleSelect, onContextAction, onAdd, onRefresh, refreshing = false }: ModelVmDashboardProps) {
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({})
  const [openVmId, setOpenVmId] = useState<string | null>(null)
  const processes = vms.flatMap((vm) => vm.processes)
  const groupToneByProcessId: Record<string, GroupTone> = {}
  const groupColorByProcessId: Record<string, string> = {}

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey())
      if (saved) setColorOverrides(JSON.parse(saved) as Record<string, string>)
    } catch {
      setColorOverrides({})
    }
  }, [])

  const updateVmColor = (vmId: string, color?: string) => {
    setColorOverrides((current) => {
      const next = { ...current }
      if (color) next[vmId] = color
      else delete next[vmId]
      try { localStorage.setItem(getStorageKey(), JSON.stringify(next)) } catch { /* 개인 설정 저장 실패는 화면 동작을 막지 않는다. */ }
      return next
    })
    setOpenVmId(null)
  }

  vms.forEach((vm, index) => vm.processes.forEach((process) => {
    groupToneByProcessId[process.id] = tones[index % tones.length]
    groupColorByProcessId[process.id] = colorOverrides[vm.vmId] ?? autoColors[tones[index % tones.length]]
  }))

  if (!processes.length) return <section className="flex h-full min-h-[280px] flex-1 flex-col items-center justify-center gap-2 rounded border border-dashed border-slate-300 bg-white px-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"><p>등록된 AI 모델 프로세스가 없습니다.</p><ModelProcessHoneycomb processes={[]} controlDialogOpen={controlDialogOpen} onSelect={onSelect} onAdd={onAdd} onRefresh={onRefresh} refreshing={refreshing} /></section>
  return <section data-model-vm-dashboard className="flex h-full min-h-0 flex-1 flex-col overflow-auto px-2 py-2" onPointerDown={(event) => { const target = event.target as HTMLElement; if (!target.closest('[data-model-process], [data-model-control-menu]')) onClearSelection?.() }}><div className="mb-2 flex shrink-0 items-start justify-between gap-3"><div className="flex flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">{vms.map((vm, index) => { const tone = tones[index % tones.length]; const color = colorOverrides[vm.vmId] ?? autoColors[tone]; return <span key={vm.vmId} className="relative inline-flex items-center gap-1.5"><button type="button" aria-label={`${vm.vmName} 색상 변경`} title={`${vm.vmName} 색상 변경`} onClick={() => setOpenVmId((current) => current === vm.vmId ? null : vm.vmId)} className="h-3 w-3 rounded-full ring-2 ring-transparent transition hover:scale-125 hover:ring-slate-400" style={{ backgroundColor: color }} /> <span className="font-semibold text-slate-700 dark:text-slate-200">{vm.vmName}</span><span>{vm.processes.length}개</span><span>{vmStatusLabel[vm.connectionStatus]}</span>{openVmId === vm.vmId ? <span className="absolute left-0 top-6 z-30 flex w-40 flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-600 dark:bg-slate-800">{colorPalette.map((paletteColor) => <button key={paletteColor} type="button" aria-label={`${paletteColor} 선택`} title={paletteColor} onClick={() => updateVmColor(vm.vmId, paletteColor)} className="h-6 w-6 rounded-full ring-2 ring-transparent transition hover:scale-110 hover:ring-slate-400" style={{ backgroundColor: paletteColor }} />)}<button type="button" onClick={() => updateVmColor(vm.vmId)} className="w-full rounded border border-slate-200 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">기본 색상</button></span> : null}</span> })}</div></div><ModelProcessHoneycomb processes={processes} selectedProcessId={selectedProcessId} controlDialogOpen={controlDialogOpen} groupToneByProcessId={groupToneByProcessId} groupColorByProcessId={groupColorByProcessId} onSelect={onSelect} onDoubleSelect={onDoubleSelect} onContextAction={onContextAction} onAdd={onAdd} onRefresh={onRefresh} refreshing={refreshing} /></section>
}
