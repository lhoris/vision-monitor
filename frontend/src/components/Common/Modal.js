import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Modal({ isOpen, onClose, title, children, className, }) {
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black opacity-50", onClick: onClose }), _jsxs("div", { className: `
          relative bg-white dark:bg-gray-800
          rounded-lg shadow-xl max-w-lg w-full mx-4
          ${className || ''}
        `, children: [title && (_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: title }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })), _jsx("div", { className: "px-6 py-4", children: children })] })] }));
}
