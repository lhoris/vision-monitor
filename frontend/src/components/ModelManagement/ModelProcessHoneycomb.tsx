import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { ModelProcess } from '@/types/modelManagement'
import { linkStatusLabel, processStatusLabel } from './modelManagementUi'

type GroupTone = 'sky' | 'emerald' | 'amber' | 'violet'

interface ModelProcessHoneycombProps {
  processes: ModelProcess[]
  selectedProcessId?: string
  groupTone?: GroupTone
  groupToneByProcessId?: Record<string, GroupTone>
  onSelect: (process: ModelProcess) => void
  onDoubleSelect?: (process: ModelProcess) => void
}

interface AxialCoordinate { q: number; r: number }

const groupColors: Record<GroupTone, string> = { sky: '#0ea5e9', emerald: '#10b981', amber: '#f59e0b', violet: '#8b5cf6' }
const statusColors: Record<string, string> = { running: '#6ee7b7', stopped: '#e2e8f0', starting: '#bae6fd', stopping: '#bae6fd', restarting: '#fde68a', error: '#fda4af', unknown: '#cbd5e1' }

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

function getLabelFontSize(value: string, base: number, minimum: number) { return Math.max(minimum, Math.min(base, Math.floor(132 / Math.max(value.length, 1)))) }
function shortenLabel(value: string, maxLength: number) { return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value }

function getStatusBadgeClass(status: string) {
  if (status === 'running' || status === 'normal') return 'bg-emerald-400/15 text-emerald-300'
  if (status === 'error' || status === 'failed') return 'bg-rose-400/15 text-rose-300'
  if (status === 'stopped') return 'bg-slate-400/15 text-slate-300'
  return 'bg-amber-400/15 text-amber-200'
}

export function ModelProcessHoneycomb({ processes, selectedProcessId, groupTone = 'sky', groupToneByProcessId, onSelect, onDoubleSelect }: ModelProcessHoneycombProps) {
  const clickTimer = useRef<number | null>(null)
  const [hoveredProcess, setHoveredProcess] = useState<ModelProcess | null>(null)
  useEffect(() => () => { if (clickTimer.current) window.clearTimeout(clickTimer.current) }, [])

  const maxVisible = 18
  const hiddenCount = Math.max(0, processes.length - maxVisible)
  const visibleProcesses = hiddenCount ? [...processes.slice(0, maxVisible - 1), null] : processes
  if (!visibleProcesses.length) return null

  const hexSize = 54
  const hexHeight = Math.sqrt(3) * hexSize
  const coordinates = getCoordinates(visibleProcesses.length)
  const points = (x: number, y: number) => [[x + hexSize, y], [x + hexSize / 2, y + hexHeight / 2], [x - hexSize / 2, y + hexHeight / 2], [x - hexSize, y], [x - hexSize / 2, y - hexHeight / 2], [x + hexSize / 2, y - hexHeight / 2]].map(([pointX, pointY]) => `${pointX},${pointY}`).join(' ')
  const centers = coordinates.map(({ q, r }) => ({ x: hexSize * 1.5 * q, y: hexHeight * (r + q / 2) }))
  const minX = Math.min(...centers.map(({ x }) => x)) - hexSize
  const maxX = Math.max(...centers.map(({ x }) => x)) + hexSize
  const minY = Math.min(...centers.map(({ y }) => y)) - hexHeight / 2
  const maxY = Math.max(...centers.map(({ y }) => y)) + hexHeight / 2
  const viewBox = `${minX - 12} ${minY - 12} ${maxX - minX + 24} ${maxY - minY + 24}`

  return <div className="relative mx-auto flex w-full justify-center overflow-visible py-3">
    {hoveredProcess ? <div id="model-process-tooltip" role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-[100] mt-2 w-64 max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-lg border border-sky-300/70 bg-slate-800 p-3 text-left text-xs text-slate-100 opacity-100 shadow-[0_14px_32px_rgba(2,6,23,0.65)] ring-1 ring-slate-950/60 lg:left-[calc(50%+210px)] lg:top-1/2 lg:mt-0 lg:translate-x-0 lg:-translate-y-1/2">
      <div className="flex items-start justify-between gap-3 border-b border-slate-700 pb-2"><div className="min-w-0"><p className="truncate font-semibold text-white">{hoveredProcess.modelName}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{hoveredProcess.processName}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusBadgeClass(hoveredProcess.processStatus)}`}>{processStatusLabel[hoveredProcess.processStatus]}</span></div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt className="text-slate-500">VM</dt><dd className="truncate text-right text-slate-200">{hoveredProcess.vmName || '-'}</dd><dt className="text-slate-500">서버 IP</dt><dd className="truncate text-right font-mono text-slate-200">{hoveredProcess.serverIp || '-'}</dd><dt className="text-slate-500">모니터링</dt><dd className="text-right"><span className={`rounded px-1.5 py-0.5 ${getStatusBadgeClass(hoveredProcess.monitoringStatus)}`}>{linkStatusLabel[hoveredProcess.monitoringStatus]}</span></dd><dt className="text-slate-500">제어 연동</dt><dd className="text-right"><span className={`rounded px-1.5 py-0.5 ${getStatusBadgeClass(hoveredProcess.controlStatus)}`}>{linkStatusLabel[hoveredProcess.controlStatus]}</span></dd></dl>
      <p className="mt-2 border-t border-slate-700 pt-2 text-[10px] text-slate-500">클릭: 이벤트 로그 · 더블클릭: 프로세스 제어</p>
    </div> : null}
    <svg className="h-auto max-h-[300px] w-full max-w-[380px]" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="group" aria-label="AI 모델 프로세스 Honeycomb"><title>AI 모델 프로세스 상태</title>{visibleProcesses.map((process, index) => {
      const center = centers[index]
      if (!process) return <polygon key="more" points={points(center.x, center.y)} fill="#64748b" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
      const tone = groupToneByProcessId?.[process.id] ?? groupTone
      const selected = process.id === selectedProcessId
      const modelLabel = shortenLabel(process.modelName, 14)
      const processLabel = shortenLabel(process.processName, 13)
      const selectWithClickGuard = () => { if (clickTimer.current) window.clearTimeout(clickTimer.current); clickTimer.current = window.setTimeout(() => { onSelect(process); clickTimer.current = null }, 220) }
      const openControlDialog = () => { if (clickTimer.current) window.clearTimeout(clickTimer.current); clickTimer.current = null; onDoubleSelect?.(process) }
      return <g key={process.id} role="button" tabIndex={0} aria-label={`${process.modelName} 프로세스 선택`} aria-describedby={hoveredProcess?.id === process.id ? 'model-process-tooltip' : undefined} aria-pressed={selected} onClick={selectWithClickGuard} onDoubleClick={openControlDialog} onMouseEnter={() => setHoveredProcess(process)} onMouseLeave={() => setHoveredProcess(null)} onKeyDown={(event) => handleKeyDown(event, () => onSelect(process))} className="cursor-pointer outline-none"><polygon points={points(center.x, center.y)} fill={groupColors[tone]} stroke={selected ? '#f8fafc' : '#0f172a'} strokeWidth={selected ? 5 : 3} strokeLinejoin="round" /><text x={center.x} y={center.y - 13} textAnchor="middle" fill="white" fontSize={getLabelFontSize(modelLabel, 12, 8)} fontWeight="700">{modelLabel}</text><text x={center.x} y={center.y + 3} textAnchor="middle" fill="white" fontSize={getLabelFontSize(processLabel, 10, 7)}>{processLabel}</text><circle cx={center.x - 35} cy={center.y + 31} r="4" fill={statusColors[process.processStatus] ?? statusColors.unknown} /><text x={center.x - 27} y={center.y + 35} fill="white" fontSize="8" fontWeight="700">{processStatusLabel[process.processStatus]}</text></g>
    })}</svg>
  </div>
}
