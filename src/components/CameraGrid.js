import { jsx as _jsx } from "react/jsx-runtime";
import { CameraCard } from './CameraCard';
import styles from '../styles/CameraGrid.module.css';
export function CameraGrid({ cameras }) {
    return (_jsx("div", { className: styles.container, children: cameras.map((camera) => (_jsx(CameraCard, { camera: camera }, camera.id))) }));
}
