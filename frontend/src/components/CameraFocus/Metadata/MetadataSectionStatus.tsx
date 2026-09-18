export function MetadataSectionStatus({ status, message }: { status: string; message?: string }) {
  if (status === 'loading') return <p className="text-xs text-slate-500">조회 중...</p>
  if (status === 'error') return <p className="text-xs text-rose-600">{message || '조회에 실패했습니다.'}</p>
  if (status === 'empty') return <p className="text-xs text-slate-500">표시할 데이터가 없습니다.</p>
  return null
}
