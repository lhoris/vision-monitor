import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LayoutSelector = ({ currentLayout, options, onLayoutChange, disabled = false, }) => {
    const handleChange = (e) => {
        const selected = options.find((opt) => opt.label === e.target.value);
        if (selected) {
            onLayoutChange(selected);
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("label", { htmlFor: "layout-select", className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Grid Layout:" }), _jsx("select", { id: "layout-select", value: currentLayout, onChange: handleChange, disabled: disabled, className: "px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600\n                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100\n                   hover:border-gray-400 dark:hover:border-gray-500\n                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\n                   disabled:opacity-50 disabled:cursor-not-allowed\n                   transition-colors", children: options.map((option) => (_jsx("option", { value: option.label, children: option.label }, option.label))) })] }));
};
export default LayoutSelector;
