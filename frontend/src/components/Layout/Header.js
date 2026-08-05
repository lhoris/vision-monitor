import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSidebar, setThemeMode, } from '@/store/slices/uiSlice';
export function Header() {
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.ui.themeMode);
    const notifications = useAppSelector((state) => state.ui.notifications);
    const handleThemeToggle = () => {
        const newMode = themeMode === 'dark' ? 'light' : 'dark';
        dispatch(setThemeMode(newMode));
        if (newMode === 'dark') {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    };
    return (_jsx("header", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40", children: _jsxs("div", { className: "flex items-center justify-between h-16 px-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => dispatch(toggleSidebar()), className: "md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }), _jsx("h1", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Dashboard" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "relative", children: _jsxs("button", { className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative", children: [_jsx("svg", { className: "w-5 h-5 text-gray-700 dark:text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }), notifications.length > 0 && (_jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" }))] }) }), _jsx("button", { onClick: handleThemeToggle, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg", children: themeMode === 'dark' ? (_jsx("svg", { className: "w-5 h-5 text-yellow-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M10.5 1.5H9.5V.5h1v1zm4.384 2.116l.707-.707.707.707-.707.707-.707-.707zm2.616 1.384h1v1h-1v-1zM15 10.5v-1h1v1h-1zm1.384 4.384l.707.707-.707.707-.707-.707.707-.707zM10.5 15.5h-1v-1h1v1zm-4.384-2.116l-.707.707-.707-.707.707-.707.707.707zM3.5 10.5v-1h-1v1h1zm-1.384-4.384l-.707-.707.707-.707.707.707-.707.707zM10 5a5 5 0 110 10A5 5 0 0110 5z" }) })) : (_jsx("svg", { className: "w-5 h-5 text-gray-700", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" }) })) }), _jsx("button", { className: "flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg", children: _jsx("div", { className: "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white text-sm font-semibold", children: "VM" }) }) })] })] }) }));
}
