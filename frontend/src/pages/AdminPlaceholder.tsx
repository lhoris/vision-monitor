import { useLocation } from 'react-router-dom'
import UserManagement from './UserManagement'

const adminPageLabels: Record<string, string> = {
  '/admin/monitoring-communication': '모니터링 통신 현황',
  '/admin/control-communication': '제어 연동 통신 현황',
  '/admin/external-addresses': '기타 주소 설정 현황',
  '/admin/model-restart': '모델 재가동',
  '/admin/video-models/new': '영상 모델 추가',
  '/admin/users': '사용자 관리',
  '/admin/roles': '역할 관리',
  '/admin/permission-policies': '권한 정책 관리',
  '/admin/menu-access': '메뉴 접근 권한 관리',
}

export function AdminPlaceholder() {
  const location = useLocation()
  if (location.pathname === '/admin/users') return <UserManagement />
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
