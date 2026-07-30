import { memo } from 'react';
import { VideoPanel } from './VideoPanel';
import type { Camera } from '../types/index';
import styles from '../styles/CameraCard.module.css';

interface CameraCardProps {
  camera: Camera;
}

function CameraCardContent({ camera }: CameraCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.info}>
          <div className={styles.name}>{camera.name}</div>
          <div className={styles.location}>{camera.location}</div>
        </div>
        {camera.isLive && (
          <div className={styles.badge}>
            <span className={styles.indicator}></span>
            LIVE
          </div>
        )}
      </div>

      <div className={styles.videoContainer}>
        <VideoPanel videoUrl={camera.videoUrl} cameraName={camera.name} cameraId={camera.id} />
      </div>

      <div className={styles.footer}>
        <div className={styles.status}>
          <span className={styles.statusIndicator}></span>
          {camera.status === 'connected' ? 'Connected' : 'Disconnected'}
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>Camera ID: {camera.id}</div>
      </div>
    </div>
  );
}

export const CameraCard = memo(CameraCardContent);
