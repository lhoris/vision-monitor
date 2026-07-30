import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Header } from './Header';
import { SummaryCards } from './SummaryCards';
import { CameraGrid } from './CameraGrid';
import { MOCK_CAMERAS, calculateStats } from '../utils/mockData';
import styles from '../styles/DashboardPage.module.css';
export function DashboardPage({ userName, onLogout }) {
    const stats = calculateStats(MOCK_CAMERAS);
    return (_jsxs("div", { className: styles.container, children: [_jsx(Header, { userName: userName, onLogout: onLogout }), _jsxs("div", { className: styles.content, children: [_jsx("div", { children: _jsx("h2", { className: styles.title, children: "Real-time CCTV Monitoring" }) }), _jsx(SummaryCards, { stats: stats }), _jsx(CameraGrid, { cameras: MOCK_CAMERAS })] })] }));
}
