import type { LinkStatus, ProcessStatus } from '@/types/modelManagement'

export const processStatusLabel: Record<ProcessStatus, string> = { running: '실행 중', stopped: '중지', error: '오류', restarting: '재시작 중', unknown: '확인 필요' }
export const linkStatusLabel: Record<LinkStatus, string> = { normal: '정상', failed: '실패', checking: '확인 중', unknown: '미수신' }
export const statusTone: Record<string, string> = { running: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', normal: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', stopped: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200', restarting: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', checking: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', error: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300', failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300', unknown: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300' }

export function formatStatusTime(value?: string) {
  if (!value) return '미수신'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function isValidServerIp(value: string) {
  return /^((25[0-5]|(2[0-4]|1\d|[1-9]?\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]?\d)))$/.test(value.trim())
}
