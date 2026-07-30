import { useState, useEffect } from 'react';
import { CameraCard } from './CameraCard';
import type { Camera } from '../types/index';
import styles from '../styles/CameraGrid.module.css';

interface CameraGridProps {
  cameras: Camera[];
}

const CAMERA_ORDER_KEY = 'visionMonitor:cameraOrder';

export function CameraGrid({ cameras: initialCameras }: CameraGridProps) {
  const [cameras, setCameras] = useState<Camera[]>(() => {
    try {
      const savedOrder = localStorage.getItem(CAMERA_ORDER_KEY);
      if (savedOrder) {
        const order = JSON.parse(savedOrder);
        return order
          .map((id: string) => initialCameras.find((c) => c.id === id))
          .filter(Boolean) as Camera[];
      }
    } catch {
      // Ignore parse errors
    }
    return initialCameras;
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CAMERA_ORDER_KEY, JSON.stringify(cameras.map((c) => c.id)));
  }, [cameras]);

  const handleDragStart = (e: React.DragEvent, camera: Camera) => {
    setDraggedId(camera.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (_e: React.DragEvent, camera: Camera) => {
    if (draggedId && draggedId !== camera.id) {
      setDragOverId(camera.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetCamera: Camera) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetCamera.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = cameras.findIndex((c) => c.id === draggedId);
    const targetIndex = cameras.findIndex((c) => c.id === targetCamera.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newCameras = [...cameras];
    const draggedCamera = newCameras[draggedIndex];
    newCameras.splice(draggedIndex, 1);
    newCameras.splice(targetIndex, 0, draggedCamera);

    setCameras(newCameras);
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className={styles.container}>
      {cameras.map((camera) => (
        <div
          key={camera.id}
          draggable
          onDragStart={(e) => handleDragStart(e, camera)}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, camera)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, camera)}
          className={`${styles.cardWrapper} ${
            draggedId === camera.id ? styles.dragging : ''
          } ${dragOverId === camera.id ? styles.dragOver : ''}`}
        >
          <CameraCard camera={camera} />
        </div>
      ))}
    </div>
  );
}
