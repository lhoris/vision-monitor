import type { ModelDashboard } from '@/types/modelManagement'

export const modelManagementDashboardFixture: ModelDashboard = {
  refreshedAt: '2026-10-09T10:00:00.000Z',
  vms: [{
    vmId: 'vm-001', vmName: 'AI VM 01', hostAddress: '10.20.4.10', connectionStatus: 'connected', lastHeartbeatAt: '2026-10-09T09:59:58.000Z',
    processes: [{ id: 'model-001', processId: 'heating', processName: '가열', modelName: '가열 감지 모델', automationName: '가열 자동화', serverIp: '10.20.4.10', pythonProjectPath: '/opt/models/heating', processStatus: 'running', monitoringStatus: 'normal', controlStatus: 'normal', lastStatusAt: '2026-10-09T09:59:57.000Z' }],
  }],
}
