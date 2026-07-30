import { jsx as _jsx } from "react/jsx-runtime";
import { EmptyVideo } from './EmptyVideo';
export function VideoPanel({ videoUrl }) {
    if (!videoUrl) {
        return _jsx(EmptyVideo, {});
    }
    return (_jsx("video", { src: videoUrl, style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            borderRadius: '4px',
            objectFit: 'cover',
        }, controls: true, playsInline: true }));
}
