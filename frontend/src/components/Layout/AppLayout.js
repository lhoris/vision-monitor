import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sidebar } from './Sidebar';
import { Header } from './Header';
export function AppLayout({ children }) {
    return (_jsxs("div", { className: "flex h-screen bg-gray-50 dark:bg-gray-900", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-auto", children: children })] })] }));
}
