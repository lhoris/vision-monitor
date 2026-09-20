import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, Button } from '@/components/Common'
import { videoSourceService } from '@/services/videoSourceService'
import type { VideoSource } from '@/types/videoSource'

export default function RecordingEntry() {
  const navigate = useNavigate()
  const [sources, setSources] = useState<VideoSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void videoSourceService.list().then((items) => {
      if (!active) return
      setSources(items)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">녹화</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          녹화 영상을 확인할 카메라를 선택하세요.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">카메라 선택</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">카메라 목록을 불러오는 중입니다.</p>
          ) : sources.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">등록된 카메라가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between gap-4 border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{source.name}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{source.protocol}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/live/cameras/${source.id}?mode=recording`)}
                  >
                    녹화 보기
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
