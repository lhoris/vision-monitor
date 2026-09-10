import { useEffect, useState } from 'react'
import { videoSourceService } from '@/services/videoSourceService'
import type { VideoProtocol, VideoSource, VideoSourceInput, VideoSourceStatus } from '@/types/videoSource'

const emptyForm: VideoSourceInput = { name: '', url: '', protocol: 'WEBRTC', location: '', zone: '', status: 'ACTIVE', remarks: '' }

export function VideoManagement() {
  const [items, setItems] = useState<VideoSource[]>([])
  const [form, setForm] = useState<VideoSourceInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const load = async () => setItems(await videoSourceService.list())
  useEffect(() => { void load() }, [])
  const updateField = (field: keyof VideoSourceInput, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const reset = () => { setEditingId(null); setForm(emptyForm); setError('') }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('')
    try {
      const saved = editingId === null ? await videoSourceService.create(form) : await videoSourceService.update(editingId, form)
      if (!saved) throw new Error('영상 주소 저장에 실패했습니다.')
      await load(); reset()
    } catch (exception) { setError(exception instanceof Error ? exception.message : '영상 주소 저장에 실패했습니다.') }
  }
  const edit = (item: VideoSource) => {
    setEditingId(item.id)
    setForm({ name: item.name, url: item.url, protocol: item.protocol, location: item.location ?? '', zone: item.zone ?? '', status: item.status, remarks: item.remarks ?? '' })
    setError('')
  }
  const remove = async (item: VideoSource) => {
    if (!window.confirm('이 영상 주소를 삭제하시겠습니까?')) return
    await videoSourceService.remove(item.id); await load(); if (editingId === item.id) reset()
  }

  return <section className="space-y-6 bg-gray-50 p-6 dark:bg-gray-900">
    <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">영상 관리</h1><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">라이브 모니터링에서 사용할 영상 주소를 등록하고 관리합니다.</p></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900"><tr><th className="px-4 py-3">영상 이름</th><th className="px-4 py-3">영상 주소</th><th className="px-4 py-3">프로토콜</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">작업</th></tr></thead>
          <tbody>{items.map((item) => <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700"><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}<span className="block text-xs text-gray-500">{item.location} {item.zone}</span></td><td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300" title={item.url}>{item.url}</td><td className="px-4 py-3 text-gray-700 dark:text-gray-200">{item.protocol}</td><td className="px-4 py-3"><span className={item.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}>{item.status}</span></td><td className="whitespace-nowrap px-4 py-3"><button type="button" className="mr-3 text-blue-600 hover:underline" onClick={() => edit(item)}>수정</button><button type="button" className="text-red-600 hover:underline" onClick={() => void remove(item)}>삭제</button></td></tr>)}</tbody></table>
        {items.length === 0 && <p className="p-8 text-center text-sm text-gray-500">등록된 영상 주소가 없습니다.</p>}
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"><h2 className="font-semibold text-gray-900 dark:text-white">{editingId === null ? '영상 추가' : '영상 편집'}</h2>
        <label className="block text-sm text-gray-700 dark:text-gray-200">영상 이름<input required value={form.name} onChange={(event) => updateField('name', event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-gray-900" /></label>
        <label className="block text-sm text-gray-700 dark:text-gray-200">영상 주소<input required value={form.url} onChange={(event) => updateField('url', event.target.value)} className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm text-gray-900" placeholder="https://... / rtsp://..." /></label>
        <label className="block text-sm text-gray-700 dark:text-gray-200">프로토콜<select value={form.protocol} onChange={(event) => updateField('protocol', event.target.value as VideoProtocol)} className="mt-1 w-full rounded border px-3 py-2 text-gray-900"><option value="WEBRTC">WebRTC</option><option value="RTSP">RTSP</option><option value="HLS">HLS</option></select></label>
        <div className="grid grid-cols-2 gap-3"><label className="block text-sm text-gray-700 dark:text-gray-200">위치<input value={form.location} onChange={(event) => updateField('location', event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-gray-900" /></label><label className="block text-sm text-gray-700 dark:text-gray-200">구역<input value={form.zone} onChange={(event) => updateField('zone', event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-gray-900" /></label></div>
        <label className="block text-sm text-gray-700 dark:text-gray-200">상태<select value={form.status} onChange={(event) => updateField('status', event.target.value as VideoSourceStatus)} className="mt-1 w-full rounded border px-3 py-2 text-gray-900"><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}<div className="flex gap-2"><button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">저장</button>{editingId !== null && <button type="button" onClick={reset} className="rounded border px-4 py-2 text-sm">취소</button>}</div>
      </form>
    </div>
  </section>
}

export default VideoManagement
