import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FocusMetadataPanel } from '../FocusMetadataPanel'
import type { CameraFocusDto } from '@/types/cameraFocus'

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
  it('renders camera focus metadata', () => {
    render(<FocusMetadataPanel camera={camera} />)

    expect(screen.getByText('Entry Zone CAM-01')).toBeInTheDocument()
    expect(screen.getByText('냉각')).toBeInTheDocument()
    expect(screen.getByText('Entry Zone')).toBeInTheDocument()
    expect(screen.getByText('online')).toBeInTheDocument()
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
})
