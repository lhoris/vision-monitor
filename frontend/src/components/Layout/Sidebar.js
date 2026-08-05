import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
const navItems = [
    {
        path: '/live',
        label: 'Live Monitoring',
        icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" }) })),
    },
    {
        path: '/playback',
        label: 'Playback',
        icon: (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })] })),
    },
    {
        path: '/events',
        label: 'Events',
        icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) })),
    },
    {
        path: '/settings',
        label: 'Settings',
        icon: (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] })),
    },
];
export function Sidebar() {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
    return (_jsxs(_Fragment, { children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 z-40 bg-black opacity-50 md:hidden", onClick: () => dispatch(toggleSidebar()) })), _jsxs("nav", { className: `
          fixed md:static
          h-screen w-64 z-50
          bg-gray-900 text-white
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
          border-r border-gray-800
        `, children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-800", children: [_jsx("h1", { className: "text-xl font-bold", children: "Vision Monitor" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Manufacturing VMS" })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-2", children: navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (_jsxs(Link, { to: item.path, onClick: () => {
                                    if (window.innerWidth < 768) {
                                        dispatch(toggleSidebar());
                                    }
                                }, className: `
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors font-medium
                  ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                `, children: [item.icon, _jsx("span", { children: item.label })] }, item.path));
                        }) }), _jsx("div", { className: "px-6 py-4 border-t border-gray-800 text-xs text-gray-400", children: _jsx("p", { children: "v1.0.0" }) })] })] }));
}
