import { Video } from 'lucide-react';

export function EmptyVideo() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        borderRadius: '4px',
        flexDirection: 'column',
        gap: '8px',
        color: '#808080',
      }}
    >
      <Video size={48} opacity={0.5} />
      <span>Video Waiting...</span>
    </div>
  );
}
