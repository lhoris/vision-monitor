import type { ProcessArea } from '@/types/modelManagement'

export function ProcessMultiSelectFilter({ areas, selectedIds, onChange, onAdd }: { areas: ProcessArea[]; selectedIds: string[]; onChange: (ids: string[]) => void; onAdd: () => void }) {
  const select = (id: string) => {
    if (id === 'all') return onChange(['all'])
    if (selectedIds.includes('all')) return onChange([id])
    const next = selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]
    onChange(next.length ? next : ['all'])
  }
  return <div className="flex flex-wrap items-center gap-2" aria-label="공정 선택 필터">
    {areas.map((area) => <label key={area.id} className={`inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm font-medium transition-colors ${selectedIds.includes(area.id) ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'}`}><input type="checkbox" checked={selectedIds.includes(area.id)} onChange={() => select(area.id)} />{area.name}</label>)}
    <button type="button" onClick={onAdd} className="rounded border border-dashed border-blue-400 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/40">+ 공정 추가</button>
  </div>
}
