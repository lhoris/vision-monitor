import { Clock } from './Clock';
import { Radio } from 'lucide-react';
import styles from '../styles/Header.module.css';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Radio size={20} />
        Vision Monitor
      </div>

      <div className={styles.middle}>
        <div className={styles.status}>
          <div className={styles.timeLabel}>Current Time</div>
          <div className={styles.time}>
            <Clock />
          </div>
        </div>

        <div className={styles.status}>
          <div className={styles.statusLabel}>Status</div>
          <div className={styles.statusBadge}>
            <span className={styles.statusIndicator}></span>
            Connected
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <div className={styles.userLabel}>User</div>
          <div className={styles.userName}>{userName}</div>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
