import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock } from './Clock';
import { Radio } from 'lucide-react';
import styles from '../styles/Header.module.css';
export function Header({ userName, onLogout }) {
    return (_jsxs("header", { className: styles.header, children: [_jsxs("div", { className: styles.logo, children: [_jsx(Radio, { size: 20 }), "Vision Monitor"] }), _jsxs("div", { className: styles.middle, children: [_jsxs("div", { className: styles.status, children: [_jsx("div", { className: styles.timeLabel, children: "Current Time" }), _jsx("div", { className: styles.time, children: _jsx(Clock, {}) })] }), _jsxs("div", { className: styles.status, children: [_jsx("div", { className: styles.statusLabel, children: "Status" }), _jsxs("div", { className: styles.statusBadge, children: [_jsx("span", { className: styles.statusIndicator }), "Connected"] })] })] }), _jsxs("div", { className: styles.right, children: [_jsxs("div", { className: styles.userInfo, children: [_jsx("div", { className: styles.userLabel, children: "User" }), _jsx("div", { className: styles.userName, children: userName })] }), _jsx("button", { className: styles.logoutButton, onClick: onLogout, children: "Logout" })] })] }));
}
