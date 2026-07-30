import type { DashboardStats } from '../types/index';
import styles from '../styles/SummaryCards.module.css';

interface SummaryCardsProps {
  stats: DashboardStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.label}>Total Cameras</div>
        <div className={styles.value}>{stats.totalCameras}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Connected</div>
        <div className={styles.value}>{stats.connectedCameras}</div>
      </div>
      <div className={styles.card}>
        <div className={styles.label}>Abnormal</div>
        <div className={styles.value}>{stats.abnormalCameras}</div>
      </div>
    </div>
  );
}
