import { useState } from 'react'
import type { ModelControlAction, ModelProcess } from '@/types/modelManagement'

interface Props {
  process: ModelProcess
  busy: boolean
  onControl: (action: ModelControlAction) => void
  onSettings: () => void
  onLogs: () => void
  onDelete: () => void
}

export function ModelProcessActions({ process, busy, onControl, onSettings, onLogs, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const commandPending = ['requested', 'processing', 'running'].includes(process.controlRequestStatus ?? '')
  const actionDisabled = busy || commandPending
  const run = (callback: () => void) => { setOpen(false); callback() }

  return <div className="relative flex justify-center">
    <button type="button" aria-label={`${process.modelName} 작업 메뉴`} aria-expanded={open} title="작업 메뉴" onClick={() => setOpen((current) => !current)} className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm8.25 3.75-1.65-.6a6.8 6.8 0 0 1-.55-1.33l.73-1.6-1.55-1.55-1.6.73a6.8 6.8 0 0 0-1.33-.55L13.7 5.4h-2.2l-.6 1.65c-.47.14-.92.33-1.33.55l-1.6-.73-1.55 1.55.73 1.6c-.22.41-.4.86-.55 1.33l-1.65.6v2.2l1.65.6c.14.47.33.92.55 1.33l-.73 1.6 1.55 1.55 1.6-.73c.41.22.86.33 1.33.55l.6 1.65h2.2l.6-1.65c.47-.14.92-.33 1.33-.55l1.6.73-1.55 1.55-.73-1.6c.22-.41.4-.86.55-1.33l1.65-.6v-2.2Z" /></svg></button>
    {open && <div role="menu" className="absolute right-0 top-10 z-20 min-w-28 rounded border border-slate-200 bg-white p-1 text-left shadow-lg dark:border-slate-600 dark:bg-slate-800">
      <button type="button" role="menuitem" disabled={actionDisabled || process.processStatus === 'running'} onClick={() => run(() => onControl('start'))} className="block w-full rounded px-3 py-1.5 text-xs hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700">시작</button>
      <button type="button" role="menuitem" disabled={actionDisabled || process.processStatus === 'stopped'} onClick={() => run(() => onControl('stop'))} className="block w-full rounded px-3 py-1.5 text-xs hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700">정지</button>
      <button type="button" role="menuitem" disabled={actionDisabled} onClick={() => run(() => onControl('restart'))} className="block w-full rounded px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-300 dark:hover:bg-amber-950/40">재시작</button>
      <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
      <button type="button" role="menuitem" onClick={() => run(onSettings)} className="block w-full rounded px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40">설정</button>
      <button type="button" role="menuitem" onClick={() => run(onLogs)} className="block w-full rounded px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700">로그</button>
      <button type="button" role="menuitem" disabled={actionDisabled || ['running', 'starting', 'stopping', 'restarting'].includes(process.processStatus)} onClick={() => run(onDelete)} className="block w-full rounded bg-rose-50 px-3 py-1.5 text-left text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-950/50 dark:text-rose-200 dark:hover:bg-rose-950/80">삭제</button>
    </div>}
  </div>
}
