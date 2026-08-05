import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children, className, onClick }) {
    return (_jsx("div", { className: `
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-md hover:shadow-lg
        transition-shadow
        ${onClick ? 'cursor-pointer' : ''}
        ${className || ''}
      `, onClick: onClick, children: children }));
}
export function CardHeader({ children, className }) {
    return (_jsx("div", { className: `
        px-6 py-4
        border-b border-gray-200 dark:border-gray-700
        ${className || ''}
      `, children: children }));
}
export function CardBody({ children, className }) {
    return (_jsx("div", { className: `px-6 py-4 ${className || ''}`, children: children }));
}
export function CardFooter({ children, className }) {
    return (_jsx("div", { className: `
        px-6 py-4
        border-t border-gray-200 dark:border-gray-700
        ${className || ''}
      `, children: children }));
}
