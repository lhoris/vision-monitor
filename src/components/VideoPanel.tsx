import { useEffect, useRef, useState } from 'react';
import { EmptyVideo } from './EmptyVideo';

interface VideoPanelProps {
  videoUrl?: string;
  cameraName?: string;
  cameraId?: string;
}

export function VideoPanel({ videoUrl, cameraName, cameraId }: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      // Semi-transparent dark overlay at top
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, 60);

      // Semi-transparent dark overlay at bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

      // LIVE badge (top left)
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(20, 18, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e0e0e0';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('LIVE', 35, 22);

      // Camera name (top left, below LIVE)
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '12px monospace';
      const nameText = cameraName || 'Camera';
      ctx.fillText(nameText, 20, 45);

      // Camera ID (top right)
      ctx.fillStyle = '#808080';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(cameraId || 'CAM000', canvas.width - 20, 22);

      // Recording indicator (bottom left)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(20, canvas.height - 25, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e0e0e0';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('REC', 35, canvas.height - 22);

      // Time display (bottom center)
      ctx.fillStyle = '#e0e0e0';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      ctx.fillText(timeStr, canvas.width / 2, canvas.height - 22);

      // Connection status (bottom right)
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(canvas.width - 20, canvas.height - 25, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e0e0e0';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('CONNECTED', canvas.width - 35, canvas.height - 22);
    };

    drawOverlay();
  }, [time, cameraName, cameraId]);

  if (!videoUrl) {
    return <EmptyVideo />;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          borderRadius: '4px',
          objectFit: 'cover',
          display: 'block',
        }}
        autoPlay
        loop
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
