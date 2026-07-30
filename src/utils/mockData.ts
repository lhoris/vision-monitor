import type { Camera, DashboardStats } from '../types/index';

const VIDEO_URLS = [
  '/video1.mp4',
  '/video2.mp4',
  '/video3.mp4',
  '/video4.mp4',
  '/video5.mp4',
  '/video6.mp4',
];

export const MOCK_CAMERAS: Camera[] = [
  {
    id: 'CAM001',
    name: 'Production Line A',
    location: 'Factory Floor - Section 1',
    status: 'connected',
    isLive: true,
    videoUrl: VIDEO_URLS[0],
  },
  {
    id: 'CAM002',
    name: 'Production Line B',
    location: 'Factory Floor - Section 2',
    status: 'connected',
    isLive: true,
    videoUrl: VIDEO_URLS[1],
  },
  {
    id: 'CAM003',
    name: 'Assembly Area',
    location: 'Factory Floor - Section 3',
    status: 'connected',
    isLive: true,
    videoUrl: VIDEO_URLS[2],
  },
  {
    id: 'CAM004',
    name: 'Quality Control',
    location: 'QC Department',
    status: 'connected',
    isLive: true,
    videoUrl: VIDEO_URLS[3],
  },
  {
    id: 'CAM005',
    name: 'Warehouse Entry',
    location: 'Warehouse - Entrance',
    status: 'connected',
    isLive: true,
    videoUrl: VIDEO_URLS[4],
  },
  {
    id: 'CAM006',
    name: 'Packing Station',
    location: 'Warehouse - Packing Area',
    status: 'connected',
    isLive: true,
    videoUrl: VIDEO_URLS[5],
  },
];

export function calculateStats(cameras: Camera[]): DashboardStats {
  return {
    totalCameras: cameras.length,
    connectedCameras: cameras.filter((c) => c.status === 'connected').length,
    abnormalCameras: 0,
  };
}
