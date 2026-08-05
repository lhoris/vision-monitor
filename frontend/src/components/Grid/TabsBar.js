import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Tabs Bar Component
 * 공정별 탭 관리 UI
 */
import { useState } from 'react';
export const TabsBar = ({ tabs, activeTabId, onTabChange, onAddTab, onRemoveTab, onRenameTab, }) => {
    const [editingTabId, setEditingTabId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [showAddTabInput, setShowAddTabInput] = useState(false);
    const [newTabName, setNewTabName] = useState('');
    const handleRenameSubmit = (tabId) => {
        if (editingName.trim() && onRenameTab) {
            onRenameTab(tabId, editingName.trim());
            setEditingTabId(null);
            setEditingName('');
        }
    };
    const handleAddTabSubmit = () => {
        if (newTabName.trim()) {
            const newTab = {
                id: `tab-${Date.now()}`,
                name: newTabName.trim(),
                cameras: [],
                gridConfig: {
                    rows: 3,
                    cols: 2,
                    layout: 'grid',
                    gapSize: 8,
                },
                cameraPositions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            onAddTab(newTab);
            setNewTabName('');
            setShowAddTabInput(false);
        }
    };
    return (_jsx("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2 overflow-x-auto pb-2", children: [tabs.map((tab) => (_jsx("div", { onClick: () => onTabChange(tab.id), className: `relative group px-4 py-2 rounded-t-lg cursor-pointer whitespace-nowrap
                transition-all duration-200 flex items-center gap-2
                ${activeTabId === tab.id
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}
              `, children: editingTabId === tab.id ? (_jsx("input", { autoFocus: true, type: "text", value: editingName, onChange: (e) => setEditingName(e.target.value), onBlur: () => handleRenameSubmit(tab.id), onKeyDown: (e) => {
                                if (e.key === 'Enter') {
                                    handleRenameSubmit(tab.id);
                                }
                                else if (e.key === 'Escape') {
                                    setEditingTabId(null);
                                    setEditingName('');
                                }
                            }, onClick: (e) => e.stopPropagation(), className: "px-2 py-1 rounded border border-blue-400 bg-white dark:bg-gray-700\n                             text-gray-900 dark:text-white text-sm" })) : (_jsxs(_Fragment, { children: [_jsx("span", { onDoubleClick: () => {
                                        setEditingTabId(tab.id);
                                        setEditingName(tab.name);
                                    }, children: tab.name }), tabs.length > 1 && (_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        onRemoveTab(tab.id);
                                    }, className: "opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600\n                                 dark:text-red-400 dark:hover:text-red-300 transition-opacity", title: "Remove tab", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })) }, tab.id))), showAddTabInput ? (_jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg", children: [_jsx("input", { autoFocus: true, type: "text", placeholder: "Tab name...", value: newTabName, onChange: (e) => setNewTabName(e.target.value), onKeyDown: (e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTabSubmit();
                                    }
                                    else if (e.key === 'Escape') {
                                        setShowAddTabInput(false);
                                        setNewTabName('');
                                    }
                                }, className: "px-2 py-1 rounded border border-gray-300 dark:border-gray-600\n                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" }), _jsx("button", { onClick: handleAddTabSubmit, className: "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }), _jsx("button", { onClick: () => {
                                    setShowAddTabInput(false);
                                    setNewTabName('');
                                }, className: "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })) : (_jsx("button", { onClick: () => setShowAddTabInput(true), className: "px-4 py-2 rounded-t-lg text-gray-600 dark:text-gray-400\n                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors", title: "Add new tab", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) }))] }) }) }));
};
export default TabsBar;
