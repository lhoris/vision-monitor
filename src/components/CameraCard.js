import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { VideoPanel } from './VideoPanel';
import styles from '../styles/CameraCard.module.css';
function CameraCardContent({ camera }) {
    return (_jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.header, children: [_jsxs("div", { className: styles.info, children: [_jsx("div", { className: styles.name, children: camera.name }), _jsx("div", { className: styles.location, children: camera.location })] }), camera.isLive && (_jsxs("div", { className: styles.badge, children: [_jsx("span", { className: styles.indicator }), "LIVE"] }))] }), _jsx("div", { className: styles.videoContainer, children: _jsx(VideoPanel, { videoUrl: camera.videoUrl }) }), _jsxs("div", { className: styles.footer, children: [_jsxs("div", { className: styles.status, children: [_jsx("span", { className: styles.statusIndicator }), camera.status === 'connected' ? 'Connected' : 'Disconnected'] }), _jsxs("div", { style: { color: 'var(--text-secondary)' }, children: ["Camera ID: ", camera.id] })] })] }));
}
export const CameraCard = memo(CameraCardContent);
