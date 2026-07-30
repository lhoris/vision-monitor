import { Header } from './Header';
import { SummaryCards } from './SummaryCards';
import { CameraGrid } from './CameraGrid';
import { MOCK_CAMERAS, calculateStats } from '../utils/mockData';
import styles from '../styles/DashboardPage.module.css';

interface DashboardPageProps {
  userName: string;
  onLogout: () => void;
}

export function DashboardPage({ userName, onLogout }: DashboardPageProps) {
  const stats = calculateStats(MOCK_CAMERAS);

  return (
    <div className={styles.container}>
      <Header userName={userName} onLogout={onLogout} />
      <div className={styles.content}>
        <div>
          <h2 className={styles.title}>Real-time CCTV Monitoring</h2>
        </div>
        <SummaryCards stats={stats} />
        <CameraGrid cameras={MOCK_CAMERAS} />
      </div>
    </div>
  );
}
