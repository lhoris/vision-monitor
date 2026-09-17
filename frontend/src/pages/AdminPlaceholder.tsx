import { useLocation } from 'react-router-dom'
import UserManagement from './UserManagement'
import VideoManagement from './VideoManagement'
import CommonCodeManagement from './CommonCodeManagement'
import ModelManagement from './ModelManagement'

const adminPageLabels: Record<string, string> = {
  '/admin/model-management': '모델 관리',
  '/admin/model-restart': '모델 관리',
  '/admin/cameras/new': '카메라 추가',
  '/admin/users': '사용자 관리',
  '/admin/videos': '영상 관리',
  '/admin/common-codes': '공통코드 관리',
}

export function AdminPlaceholder() {
  const location = useLocation()
  if (location.pathname === '/admin/users') return <UserManagement />
  if (location.pathname === '/admin/videos') return <VideoManagement />
  if (location.pathname === '/admin/common-codes') return <CommonCodeManagement />
  if (location.pathname === '/admin/model-management' || location.pathname === '/admin/model-restart') return <ModelManagement />
  const title = adminPageLabels[location.pathname] ?? '관리자 메뉴'

  return (
    <section className="flex h-full items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
      <div className="w-full max-w-2xl rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Admin
        </p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          이 화면은 관리자 메뉴 route 연결을 위한 임시 화면입니다. 상세 기능은 후속 관리자 기능에서 구현합니다.
        </p>
      </div>
    </section>
  )
}

export default AdminPlaceholder
