import type { Event, PaginatedResponse } from '@/types'

export const eventsMock: Event[] = [
  {
    id: 1,
    cameraId: 1,
    type: 'cooling_bed_temperature_high',
    severity: 'critical',
    description: '공냉대 온도 상한 초과',
    timestamp: new Date(Date.now() - 2 * 60_000),
    acknowledged: false,
    metadata: {
      coilId: 'C260921-014',
      measuredTemperatureC: 786,
      limitTemperatureC: 760,
      descriptionKo: '코일 C260921-014 공냉대 출구 온도가 786°C로 관리 상한 760°C를 초과했습니다. 냉각 상태와 라인 운전 조건을 확인하세요.',
      descriptionEn: 'Coil C260921-014 reached 786°C at the cooling-bed exit, exceeding the 760°C operating limit. Check cooling performance and line conditions.',
    },
  },
  {
    id: 2,
    cameraId: 1,
    type: 'rolling_speed_adjusted',
    severity: 'medium',
    description: '공냉대 온도 상승 대응으로 롤링 속도 상향',
    timestamp: new Date(Date.now() - 8 * 60_000),
    acknowledged: false,
    metadata: {
      coilId: 'C260921-014',
      previousSpeedMps: 0.52,
      currentSpeedMps: 0.58,
      descriptionKo: '코일 C260921-014 공냉대 온도 상승에 대응해 롤링 속도를 0.52m/s에서 0.58m/s로 상향했습니다. 변경 후 온도 추이를 확인하세요.',
      descriptionEn: 'Rolling speed for coil C260921-014 was increased from 0.52m/s to 0.58m/s in response to rising cooling-bed temperature. Verify the temperature trend after the adjustment.',
    },
  },
  {
    id: 3,
    cameraId: 2,
    type: 'entry_zone_jam',
    severity: 'high',
    description: '진입 구간 소재 정체 감지',
    timestamp: new Date(Date.now() - 18 * 60_000),
    acknowledged: false,
    metadata: {
      coilId: 'C260921-018',
      stoppedDurationSeconds: 42,
      descriptionKo: '코일 C260921-018이 진입 구간에서 42초간 정체되었습니다. 전후 설비 상태와 소재 이송 여부를 확인하세요.',
      descriptionEn: 'Coil C260921-018 was stationary in the entry zone for 42 seconds. Check upstream and downstream equipment and material transfer.',
    },
  },
  {
    id: 4,
    cameraId: 3,
    type: 'material_size_deviation',
    severity: 'high',
    description: '소재 규격 편차 감지',
    timestamp: new Date(Date.now() - 27 * 60_000),
    acknowledged: true,
    metadata: {
      coilId: 'C260921-011',
      targetDiameterMm: 22,
      measuredDiameterMm: 23.4,
      descriptionKo: '코일 C260921-011의 AI 측정 직경은 23.4mm로 목표 규격 22.0mm를 벗어났습니다. 측정 영상과 압연 조건을 확인하세요.',
      descriptionEn: 'AI measured coil C260921-011 at 23.4mm, outside the 22.0mm target. Review the inspection video and rolling conditions.',
    },
  },
  {
    id: 5,
    cameraId: 2,
    type: 'control_connection_failed',
    severity: 'critical',
    description: '제어 연동 통신 실패',
    timestamp: new Date(Date.now() - 35 * 60_000),
    acknowledged: false,
    metadata: {
      equipment: '압연기 PLC',
      descriptionKo: '압연기 PLC 제어 연동 통신에 실패해 속도 변경 명령을 전달하지 못했습니다. PLC 연결 상태를 확인하고 필요 시 현장 조치하세요.',
      descriptionEn: 'Communication with the rolling-mill PLC failed, so the speed-change command was not delivered. Check the PLC connection and take onsite action if needed.',
    },
  },
  {
    id: 6,
    cameraId: 4,
    type: 'camera_offline',
    severity: 'high',
    description: '정정 구역 카메라 연결 끊김',
    timestamp: new Date(Date.now() - 55 * 60_000),
    acknowledged: true,
    metadata: {
      cameraName: '정정 구역 출측 카메라',
      descriptionKo: '정정 구역 출측 카메라와 3분 이상 통신이 끊겼습니다. 카메라 전원과 네트워크 연결을 확인하세요.',
      descriptionEn: 'The finishing-line exit camera has been disconnected for more than 3 minutes. Check camera power and network connectivity.',
    },
  },
]

export function getEventsMock(): PaginatedResponse<Event> {
  return {
    content: eventsMock.map((event) => ({ ...event })),
    totalElements: eventsMock.length,
    totalPages: 1,
    currentPage: 0,
    pageSize: eventsMock.length,
  }
}
