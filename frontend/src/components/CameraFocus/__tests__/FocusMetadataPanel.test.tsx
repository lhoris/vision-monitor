import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FocusMetadataPanel } from '../FocusMetadataPanel'
import type { CameraFocusDto } from '@/types/cameraFocus'

const { get, post, put } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }))
vi.mock('@/services/api', () => ({ apiClient: { get, post, put } }))

const camera: CameraFocusDto = {
  cameraId: 1,
  cameraName: 'Entry Zone CAM-01',
  processType: '냉각',
  zoneName: 'Entry Zone',
  lineName: 'Line 1',
  location: '제조 구역 A',
  status: 'online',
  recordingEnabled: true,
  capabilities: {
    live: true,
    recording: true,
    ptz: false,
    overlay: false,
  },
  lastSeenAt: '2026-08-15T08:59:30+09:00',
  recentEventSummary: {
    lastEventId: 50001,
    lastSeverity: 'warning',
    lastOccurredAt: '2026-08-15T08:55:00+09:00',
    openCount: 2,
  },
}

describe('FocusMetadataPanel', () => {
  let savedProfile: { sourceId: string; sections: unknown[]; updatedAt: string } | null

  beforeEach(() => {
    localStorage.clear()
    savedProfile = null
    get.mockImplementation((url: string) => {
      if (url.startsWith('/metadata/profiles/') && savedProfile) return Promise.resolve({ data: savedProfile })
      return Promise.reject(new Error('offline'))
    })
    put.mockImplementation(async (_url: string, body: { sections: unknown[] }) => {
      savedProfile = { sourceId: '1', sections: body.sections, updatedAt: '2026-10-05T00:00:00Z' }
      return { data: savedProfile }
    })
    post.mockImplementation(async (url: string) => {
      const queryCode = decodeURIComponent(url.split('/').at(-2) ?? '')
      const rows = queryCode === 'camera.info'
        ? [{ label: 'Video Name', value: 'Entry Zone CAM-01' }, { label: 'Process', value: '냉각' }, { label: 'Zone', value: 'Entry Zone' }]
        : queryCode === 'camera.status'
          ? [{ label: 'Status', value: 'online' }]
          : []
      return { data: { queryId: queryCode, schema: [], rows, fetchedAt: '2026-10-05T00:00:00Z' } }
    })
  })

  it('renders camera focus metadata', async () => {
    render(<FocusMetadataPanel camera={camera} />)

    expect(await screen.findByText('Entry Zone CAM-01')).toBeInTheDocument()
    expect(screen.getByText('냉각')).toBeInTheDocument()
    expect(screen.getByText('Entry Zone')).toBeInTheDocument()
    expect(await screen.findByText('online')).toBeInTheDocument()
    expect(screen.getByText('표시할 데이터가 없습니다.')).toBeInTheDocument()
  })

  it('uses dash fallback for missing camera values', () => {
    render(<FocusMetadataPanel camera={{ ...camera, lastSeenAt: null }} />)

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('renders metadata error state without requiring video state', () => {
    render(<FocusMetadataPanel camera={null} error="NOT_FOUND" />)

    expect(screen.getByText('카메라 정보를 불러오지 못했습니다.')).toBeInTheDocument()
  })

  it('renders forbidden state without restricted metadata', () => {
    render(<FocusMetadataPanel camera={null} error="FORBIDDEN" />)

    expect(screen.getByText('카메라 정보 접근 권한이 없습니다.')).toBeInTheDocument()
    expect(screen.queryByText('Entry Zone CAM-01')).not.toBeInTheDocument()
  })

  it('reorders the three sections by drag and persists the order per user', async () => {
    localStorage.setItem('authUsername', 'tester1')
    const { unmount } = render(<FocusMetadataPanel camera={camera} />)
    const cameraSection = screen.getByTestId('metadata-section-camera')
    const statusSection = screen.getByTestId('metadata-section-status')
    fireEvent.dragStart(cameraSection)
    fireEvent.dragOver(statusSection)
    fireEvent.drop(statusSection)

    await waitFor(() => expect(screen.getAllByTestId(/metadata-section-/)[0]).toHaveAttribute('data-testid', 'metadata-section-status'))
    const sections = screen.getAllByTestId(/metadata-section-/)
    expect(sections[0]).toHaveAttribute('data-testid', 'metadata-section-status')
    unmount()

    render(<FocusMetadataPanel camera={camera} />)
    await waitFor(() => expect(screen.getAllByTestId(/metadata-section-/)[0]).toHaveAttribute('data-testid', 'metadata-section-status'))
    const restoredSections = screen.getAllByTestId(/metadata-section-/)
    expect(restoredSections[0]).toHaveAttribute('data-testid', 'metadata-section-status')
  })

  it('asks for confirmation before restoring the default profile', () => {
    localStorage.setItem('authUsername', 'tester1')
    render(<FocusMetadataPanel camera={camera} />)

    fireEvent.click(screen.getByRole('button', { name: '기본값' }))

    expect(screen.getByRole('dialog')).toHaveTextContent('현재 영상소스의 메타데이터 섹션 설정을 기본값으로 복원하시겠습니까?')
    fireEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('asks for confirmation before deleting a section', () => {
    render(<FocusMetadataPanel camera={camera} />)

    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[0])

    expect(screen.getByRole('dialog')).toHaveTextContent("'카메라 정보' 섹션을 삭제하시겠습니까?")
    expect(screen.getByTestId('metadata-section-camera')).toBeInTheDocument()
  })
})
