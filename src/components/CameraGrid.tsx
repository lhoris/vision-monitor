import { CameraCard } from './CameraCard';
import type { Camera } from '../types/index';
import styles from '../styles/CameraGrid.module.css';

interface CameraGridProps {
  cameras: Camera[];
}

export function CameraGrid({ cameras }: CameraGridProps) {
  return (
    <div className={styles.container}>
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  );
}
