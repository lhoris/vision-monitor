export const MOCK_CAMERAS = [
    {
        id: 'CAM001',
        name: 'Production Line A',
        location: 'Factory Floor - Section 1',
        status: 'connected',
        isLive: true,
        videoUrl: '/sample.mp4',
    },
    {
        id: 'CAM002',
        name: 'Production Line B',
        location: 'Factory Floor - Section 2',
        status: 'connected',
        isLive: true,
        videoUrl: '/sample.mp4',
    },
    {
        id: 'CAM003',
        name: 'Assembly Area',
        location: 'Factory Floor - Section 3',
        status: 'connected',
        isLive: true,
        videoUrl: '/sample.mp4',
    },
    {
        id: 'CAM004',
        name: 'Quality Control',
        location: 'QC Department',
        status: 'connected',
        isLive: true,
        videoUrl: '/sample.mp4',
    },
    {
        id: 'CAM005',
        name: 'Warehouse Entry',
        location: 'Warehouse - Entrance',
        status: 'connected',
        isLive: true,
        videoUrl: '/sample.mp4',
    },
    {
        id: 'CAM006',
        name: 'Packing Station',
        location: 'Warehouse - Packing Area',
        status: 'connected',
        isLive: true,
        videoUrl: '/sample.mp4',
    },
];
export function calculateStats(cameras) {
    return {
        totalCameras: cameras.length,
        connectedCameras: cameras.filter((c) => c.status === 'connected').length,
        abnormalCameras: 0,
    };
}
