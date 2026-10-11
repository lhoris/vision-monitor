import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { ModelControlAction, ModelProcess } from '@/types/modelManagement'
import { linkStatusLabel, processStatusLabel } from './modelManagementUi'

type GroupTone = 'sky' | 'emerald' | 'amber' | 'violet'

interface ModelProcessHoneycombProps {
  processes: ModelProcess[]
  selectedProcessId?: string
  groupTone?: GroupTone
  groupToneByProcessId?: Record<string, GroupTone>
  groupColorByProcessId?: Record<string, string>
  onSelect: (process: ModelProcess) => void
  onDoubleSelect?: (process: ModelProcess) => void
  onContextAction?: (process: ModelProcess, action: ModelControlAction) => void
  onAdd?: () => void
}

interface AxialCoordinate { q: number; r: number }

const groupColors: Record<GroupTone, string> = { sky: '#0ea5e9', emerald: '#10b981', amber: '#f59e0b', violet: '#8b5cf6' }
const statusBadgeColors: Record<string, string> = { running: '#047857', stopped: '#b91c1c', starting: '#0369a1', stopping: '#0369a1', restarting: '#b45309', error: '#881337', unknown: '#475569' }

function axialDistance({ q, r }: AxialCoordinate) { return Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) }

function getCoordinates(count: number): AxialCoordinate[] {
  const coordinates: AxialCoordinate[] = []
  let radius = 0
  while (coordinates.length < count) {
    for (let q = -radius; q <= radius && coordinates.length < count; q += 1) {
      const minR = Math.max(-radius, -q - radius)
      const maxR = Math.min(radius, -q + radius)
      for (let r = minR; r <= maxR && coordinates.length < count; r += 1) if (axialDistance({ q, r }) === radius) coordinates.push({ q, r })
    }
    radius += 1
  }
  return coordinates.sort((left, right) => axialDistance(left) - axialDistance(right) || left.r - right.r || left.q - right.q)
}

function handleKeyDown(event: KeyboardEvent<SVGGElement>, onSelect: () => void) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect() }
}

function getLabelFontSize(value: string, base: number, minimum: number) { return Math.max(minimum, Math.min(base, Math.floor(100 / Math.max(value.length, 1)))) }
function shortenLabel(value: string, maxLength: number) { return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value }

function getStatusBadgeClass(status: string) {
  if (status === 'running' || status === 'normal') return 'bg-emerald-400/15 text-emerald-300'
  if (status === 'error' || status === 'failed') return 'bg-rose-400/15 text-rose-300'
  if (status === 'stopped') return 'bg-rose-400/15 text-rose-300'
  return 'bg-amber-400/15 text-amber-200'
}

export function ModelProcessHoneycomb({ processes, selectedProcessId, groupTone = 'sky', groupToneByProcessId, groupColorByProcessId, onSelect, onDoubleSelect, onContextAction, onAdd }: ModelProcessHoneycombProps) {
  const clickTimer = useRef<number | null>(null)
  const [hoveredProcess, setHoveredProcess] = useState<ModelProcess | null>(null)
  const [contextMenu, setContextMenu] = useState<{ process: ModelProcess; x: number; y: number } | null>(null)
  useEffect(() => () => { if (clickTimer.current) window.clearTimeout(clickTimer.current) }, [])
  useEffect(() => {
    if (!contextMenu) return undefined
    const close = () => setContextMenu(null)
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape) }
  }, [contextMenu])

  const maxVisible = 18
  const hiddenCount = Math.max(0, processes.length - maxVisible)
  const visibleProcesses = hiddenCount ? [...processes.slice(0, maxVisible - 1), null] : processes
  if (!visibleProcesses.length && !onAdd) return null

  const hexSize = 54
  const hexHeight = Math.sqrt(3) * hexSize
  const cellCount = visibleProcesses.length + (onAdd ? 1 : 0)
  const coordinates = getCoordinates(cellCount)
  const points = (x: number, y: number) => [[x + hexSize, y], [x + hexSize / 2, y + hexHeight / 2], [x - hexSize / 2, y + hexHeight / 2], [x - hexSize, y], [x - hexSize / 2, y - hexHeight / 2], [x + hexSize / 2, y - hexHeight / 2]].map(([pointX, pointY]) => `${pointX},${pointY}`).join(' ')
  const centers = coordinates.map(({ q, r }) => ({ x: hexSize * 1.5 * q, y: hexHeight * (r + q / 2) }))
  const minX = Math.min(...centers.map(({ x }) => x)) - hexSize
  const maxX = Math.max(...centers.map(({ x }) => x)) + hexSize
  const minY = Math.min(...centers.map(({ y }) => y)) - hexHeight / 2
  const maxY = Math.max(...centers.map(({ y }) => y)) + hexHeight / 2
  const viewBox = `${minX - 12} ${minY - 12} ${maxX - minX + 24} ${maxY - minY + 24}`
  const selectedIndex = visibleProcesses.findIndex((process) => process?.id === selectedProcessId)
  const selectedCenter = selectedIndex >= 0 ? centers[selectedIndex] : null
  const selectedProcess = processes.find((process) => process.id === selectedProcessId) ?? null
  const tooltipProcess = hoveredProcess ?? selectedProcess

  return <div className="relative mx-auto flex h-full min-h-[320px] w-full flex-1 items-center justify-center overflow-visible py-3">
    {contextMenu ? <div data-model-control-menu role="menu" aria-label={`${contextMenu.process.modelName} 프로세스 제어 메뉴`} style={{ left: contextMenu.x, top: contextMenu.y }} className="fixed z-[110] min-w-36 rounded-lg border border-slate-600 bg-slate-900 p-1 text-left text-xs text-white shadow-2xl shadow-slate-950/50"><p className="border-b border-slate-700 px-3 py-2 font-semibold text-slate-300">{contextMenu.process.modelName}</p><button type="button" role="menuitem" disabled={contextMenu.process.processStatus === 'running' || ['requested', 'processing', 'running'].includes(contextMenu.process.controlRequestStatus ?? '')} onPointerDown={(event) => event.stopPropagation()} onClick={() => { setContextMenu(null); onContextAction?.(contextMenu.process, 'start') }} className="block w-full rounded px-3 py-2 text-left hover:bg-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-40">시작</button><button type="button" role="menuitem" disabled={contextMenu.process.processStatus === 'stopped' || ['requested', 'processing', 'running'].includes(contextMenu.process.controlRequestStatus ?? '')} onPointerDown={(event) => event.stopPropagation()} onClick={() => { setContextMenu(null); onContextAction?.(contextMenu.process, 'stop') }} className="block w-full rounded px-3 py-2 text-left hover:bg-rose-600/30 disabled:cursor-not-allowed disabled:opacity-40">중지</button><button type="button" role="menuitem" disabled={['requested', 'processing', 'running'].includes(contextMenu.process.controlRequestStatus ?? '')} onPointerDown={(event) => event.stopPropagation()} onClick={() => { setContextMenu(null); onContextAction?.(contextMenu.process, 'restart') }} className="block w-full rounded px-3 py-2 text-left text-amber-200 hover:bg-amber-600/30 disabled:cursor-not-allowed disabled:opacity-40">재시작</button></div> : null}
    {tooltipProcess ? <div id="model-process-tooltip" role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-[100] mt-2 w-[min(32rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-lg border border-sky-300/70 bg-slate-800 p-4 text-left text-xs text-slate-100 opacity-100 shadow-[0_14px_32px_rgba(2,6,23,0.65)] ring-1 ring-slate-950/60 lg:left-[calc(50%+210px)] lg:top-1/2 lg:mt-0 lg:translate-x-0 lg:-translate-y-1/2">
      <div className="flex items-start justify-between gap-4 border-b border-slate-700 pb-3"><div className="min-w-0"><p className="break-all font-semibold leading-5 text-white">{tooltipProcess.modelName}</p><p className="mt-1 break-all text-[11px] leading-4 text-slate-400">{tooltipProcess.processName}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusBadgeClass(tooltipProcess.processStatus)}`}>{processStatusLabel[tooltipProcess.processStatus]}</span></div>
      <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2"><dt className="text-slate-500">VM</dt><dd className="break-words text-right text-slate-200">{tooltipProcess.vmName || '-'}</dd><dt className="text-slate-500">서버 IP</dt><dd className="break-all text-right font-mono text-slate-200">{tooltipProcess.serverIp || '-'}</dd><dt className="text-slate-500">모니터링</dt><dd className="text-right"><span className={`rounded px-1.5 py-0.5 ${getStatusBadgeClass(tooltipProcess.monitoringStatus)}`}>{linkStatusLabel[tooltipProcess.monitoringStatus]}</span></dd><dt className="text-slate-500">제어 연동</dt><dd className="text-right"><span className={`rounded px-1.5 py-0.5 ${getStatusBadgeClass(tooltipProcess.controlStatus)}`}>{linkStatusLabel[tooltipProcess.controlStatus]}</span></dd></dl>
      <p className="mt-2 border-t border-slate-700 pt-2 text-[10px] text-slate-500">클릭: 이벤트 로그 · 더블클릭: 프로세스 제어</p>
    </div> : null}
    <svg className="h-auto max-h-[300px] w-full max-w-[380px]" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="group" aria-label="AI 모델 프로세스 Honeycomb"><title>AI 모델 프로세스 상태</title>{visibleProcesses.map((process, index) => {
      const center = centers[index]
      if (!process) return <polygon key="more" points={points(center.x, center.y)} fill="#64748b" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
      const tone = groupToneByProcessId?.[process.id] ?? groupTone
      const selected = process.id === selectedProcessId
      const modelLabel = shortenLabel(process.modelName, 11)
      const processLabel = shortenLabel(process.processName, 10)
      const statusLabel = processStatusLabel[process.processStatus]
      const statusBadgeWidth = Math.max(48, statusLabel.length * 7 + 16)
      const selectWithClickGuard = () => { if (clickTimer.current) window.clearTimeout(clickTimer.current); clickTimer.current = window.setTimeout(() => { onSelect(process); clickTimer.current = null }, 220) }
      const openControlDialog = () => { if (clickTimer.current) window.clearTimeout(clickTimer.current); clickTimer.current = null; onDoubleSelect?.(process) }
      return <g data-model-process role="button" tabIndex={0} aria-label={`${process.modelName} 프로세스 선택`} aria-describedby={tooltipProcess?.id === process.id ? 'model-process-tooltip' : undefined} aria-pressed={selected} onClick={selectWithClickGuard} onDoubleClick={openControlDialog} onContextMenu={(event) => { event.preventDefault(); setContextMenu({ process, x: Math.min(event.clientX, window.innerWidth - 160), y: Math.min(event.clientY, window.innerHeight - 150) }) }} onMouseEnter={() => setHoveredProcess(process)} onMouseLeave={() => setHoveredProcess(null)} onKeyDown={(event) => handleKeyDown(event, () => onSelect(process))} className="cursor-pointer outline-none"><polygon points={points(center.x, center.y)} fill={groupColorByProcessId?.[process.id] ?? groupColors[tone]} stroke={selected ? '#f8fafc' : '#0f172a'} strokeWidth={selected ? 5 : 3} strokeLinejoin="round" /><text x={center.x} y={center.y - 13} textAnchor="middle" fill="white" fontSize={getLabelFontSize(modelLabel, 12, 7)} fontWeight="700">{modelLabel}</text><text x={center.x} y={center.y + 3} textAnchor="middle" fill="white" fontSize={getLabelFontSize(processLabel, 10, 7)}>{processLabel}</text><rect x={center.x - statusBadgeWidth / 2} y={center.y + 20} width={statusBadgeWidth} height="16" rx="8" fill={statusBadgeColors[process.processStatus] ?? statusBadgeColors.unknown} opacity="0.95" /><text x={center.x} y={center.y + 31.5} textAnchor="middle" fill="white" fontSize="8" fontWeight="700">{statusLabel}</text></g>
    })}{onAdd ? <g role="button" tabIndex={0} aria-label="모델 추가" onClick={onAdd} onKeyDown={(event) => handleKeyDown(event, onAdd)} className="cursor-pointer outline-none"><polygon points={points(centers[visibleProcesses.length].x, centers[visibleProcesses.length].y)} fill="#1e293b" stroke="#64748b" strokeWidth="3" strokeDasharray="7 5" strokeLinejoin="round" /><text x={centers[visibleProcesses.length].x} y={centers[visibleProcesses.length].y + 7} textAnchor="middle" fill="#cbd5e1" fontSize="28" fontWeight="300">+</text></g> : null}{selectedCenter ? <polygon points={points(selectedCenter.x, selectedCenter.y)} fill="none" stroke="#f8fafc" strokeWidth="5" strokeLinejoin="round" pointerEvents="none" /> : null}</svg>
  </div>
}
