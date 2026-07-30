import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from '../styles/SummaryCards.module.css';
export function SummaryCards({ stats }) {
    return (_jsxs("div", { className: styles.container, children: [_jsxs("div", { className: styles.card, children: [_jsx("div", { className: styles.label, children: "Total Cameras" }), _jsx("div", { className: styles.value, children: stats.totalCameras })] }), _jsxs("div", { className: styles.card, children: [_jsx("div", { className: styles.label, children: "Connected" }), _jsx("div", { className: styles.value, children: stats.connectedCameras })] }), _jsxs("div", { className: styles.card, children: [_jsx("div", { className: styles.label, children: "Abnormal" }), _jsx("div", { className: styles.value, children: stats.abnormalCameras })] })] }));
}
