export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'connected' | 'disconnected';
  isLive: boolean;
  videoUrl?: string;
}

export interface DashboardStats {
  totalCameras: number;
  connectedCameras: number;
  abnormalCameras: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  userName: string;
}
